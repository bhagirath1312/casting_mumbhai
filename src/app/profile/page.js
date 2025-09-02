"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [events, setEvents] = useState([]);
  const [appliedEvents, setAppliedEvents] = useState(new Set());
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      if (user) {
        try {
          const eventsCollection = collection(db, 'casting_events');
          const q = query(eventsCollection, orderBy("createdAt", "desc"));
          const eventSnapshot = await getDocs(q);
          const eventsList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEvents(eventsList);

          const applied = new Set();
          for (const event of eventsList) {
            const applicantDocRef = doc(db, 'casting_events', event.id, 'applicants', user.uid);
            const applicantDoc = await getDoc(applicantDocRef);
            if (applicantDoc.exists()) {
              applied.add(event.id);
            }
          }
          setAppliedEvents(applied);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    if (!loading) {
      fetchData();
    }
  }, [user, loading, router]);

  if (loading || isLoadingData) {
    return <div className="text-center py-20">Loading Profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Profile Header Section */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{user.displayName}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <Link href="/profile/edit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-indigo-700">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Casting Calls Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Casting Calls</h2>
        <div className="space-y-6">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 h-48 md:h-auto relative rounded-lg overflow-hidden">
                <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{event.location} • {new Date(event.date.seconds * 1000).toLocaleDateString()}</p>
                <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>
                
                {appliedEvents.has(event.id) ? (
                  <span className="px-5 py-2 text-sm font-semibold text-gray-500 bg-gray-200 rounded-lg">
                    Applied
                  </span>
                ) : (
                  <Link href={`/events/${event.id}/applicants`} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                    Apply Now
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}