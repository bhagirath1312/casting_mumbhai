"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, orderBy, query } from 'firebase/firestore';

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const { eventId } = params;

  useEffect(() => {
    if (!eventId) return;

    const fetchApplicants = async () => {
      try {
        // Fetch the event's details to show the title
        const eventDocRef = doc(db, 'casting_events', eventId);
        const eventDoc = await getDoc(eventDocRef);
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        }

        // Fetch all documents from the 'applicants' subcollection
        const applicantsCollection = collection(db, 'casting_events', eventId, 'applicants');
        const q = query(applicantsCollection, orderBy("appliedAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApplicants(list);
      } catch (error) {
        console.error("Error fetching applicants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicants();
  }, [eventId]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-purple-500 rounded-full animate-spin"></div>
        <p className="ml-4 text-lg">Loading Applicants...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Applicants for {event ? `"${event.title}"` : 'Event'}</h1>
        <p className="text-gray-600 mb-8">{applicants.length} user(s) have applied for this casting call.</p>

        {applicants.length === 0 ? (
          <p className="p-8 text-center text-gray-500 bg-white rounded-lg shadow-md">No one has applied for this event yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicants.map(applicant => (
              <div key={applicant.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900">{applicant.name}</h2>
                  <a href={`mailto:${applicant.email}`} className="text-sm text-indigo-600 hover:underline">{applicant.email}</a>
                </div>
                
                {/* Photo Gallery */}
                <div className="px-5 mb-4">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Photos</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {applicant.photos && applicant.photos.map((photoUrl, index) => (
                            <div key={index} className="relative w-full h-24 rounded-md overflow-hidden">
                                <Image src={photoUrl} alt={`${applicant.name} photo ${index + 1}`} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Section */}
                <div className="border-t border-gray-200 px-5 py-4">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Details</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                        <p><strong>Phone:</strong> {applicant.phone || 'N/A'}</p>
                        <p><strong>Age:</strong> {applicant.age || 'N/A'}</p>
                        <p><strong>Height:</strong> {applicant.height || 'N/A'}</p>
                        <p><strong>Weight:</strong> {applicant.weight || 'N/A'} kg</p>
                        <p className="col-span-2"><strong>Address:</strong> {applicant.address || 'N/A'}</p>
                    </div>
                </div>
                
                <div className="bg-gray-50 px-5 py-3 text-xs text-gray-500 text-right">
                    Applied on: {new Date(applicant.appliedAt.seconds * 1000).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}