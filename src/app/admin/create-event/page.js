"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression'; // Import the compression library

export default function CreateEventPage() {
  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(''); // State for image preview URL

  // State for UI feedback
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show a preview of the selected image
    setImagePreview(URL.createObjectURL(file));

    // Compression options
    const options = {
      maxSizeMB: 1, // Compress image to be under 1MB
      maxWidthOrHeight: 1920, // Resize image to max 1920px on the longest side
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile); // Set the compressed file for upload
    } catch (error) {
      console.error("Image compression error:", error);
      setError("Failed to process image. Please try another file.");
      setImageFile(null);
      setImagePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !location || !date || !imageFile) {
      setError('All fields, including an event photo, are required.');
      return;
    }

    setIsLoading(true);

    try {
      // Create a unique filename for the image
      const storageRef = ref(storage, `casting_events/${Date.now()}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          console.error("Upload failed:", error);
          setError('Image upload failed. Please try again.');
          setIsLoading(false);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          const eventsCollection = collection(db, 'casting_events');
          await addDoc(eventsCollection, {
            title,
            description,
            location,
            date: new Date(date),
            imageUrl: downloadURL,
            createdAt: new Date(),
          });

          router.push('/admin');
        }
      );
    } catch (error) {
      console.error("Error creating event:", error);
      setError('Failed to create event. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0F9] flex justify-center items-center py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <Link href="/admin" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Casting Event</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
          <div className="space-y-4">
            <input type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" rows="4"></textarea>
            <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Photo</label>
              <input type="file" accept="image/*" onChange={handleImageChange} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                <Image src={imagePreview} alt="Selected event preview" width={500} height={280} className="rounded-lg object-cover w-full h-auto" />
              </div>
            )}
          </div>
          
          {isLoading && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-1">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
              {isLoading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}