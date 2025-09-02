// "use client";
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { db } from '@/lib/firebase';
// import { collection, getDocs, doc, getDoc, query, where, deleteDoc } from 'firebase/firestore'; 
// import { saveAs } from 'file-saver';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// export default function AdminDashboard() {
//   const { user, loading: authLoading } = useAuth();
//   const router = useRouter();

//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [isLoadingUsers, setIsLoadingUsers] = useState(true);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [search, setSearch] = useState('');

//   // Effect to check admin role
//   useEffect(() => {
//     if (!authLoading && !user) {
//       router.push('/login');
//       return;
//     }
//     const checkAdminRole = async () => {
//       if (user) {
//         const userDocRef = doc(db, 'users', user.uid);
//         const userDoc = await getDoc(userDocRef);
//         if (userDoc.exists() && userDoc.data().role === 'admin') {
//           setIsAdmin(true);
//         } else {
//           router.push('/');
//         }
//       }
//     };
//     if (!authLoading) checkAdminRole();
//   }, [user, authLoading, router]);

//   // Effect to fetch users
//   useEffect(() => {
//     if (!isAdmin) return;
//     const fetchUsers = async () => {
//       try {
//         const usersCollection = collection(db, 'users');
//         const q = query(usersCollection, where("role", "!=", "admin"));
//         const userSnapshot = await getDocs(q);
//         const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setUsers(usersList);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       } finally {
//         setIsLoadingUsers(false);
//       }
//     };
//     fetchUsers();
//   }, [isAdmin]);
  
//   // Effect to filter users based on search
//   useEffect(() => {
//     const searchLower = search.toLowerCase();
//     const filtered = users.filter(u => {
//       const name = u.name || '';
//       const email = u.email || '';
//       return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
//     });
//     setFilteredUsers(filtered);
//   }, [search, users]);

//   const handleDeleteUser = async (userId) => {
//     if (window.confirm('Are you sure you want to delete this user?')) {
//       try {
//         await deleteDoc(doc(db, 'users', userId));
//         setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
//         alert('User deleted successfully.');
//       } catch (error) {
//         console.error("Error deleting user: ", error);
//         alert('Failed to delete user.');
//       }
//     }
//   };
  
//   const handleExportCSV = () => { /* ... */ };
//   const handleExportPDF = () => { /* ... */ };

//   if (authLoading || isLoadingUsers || !isAdmin) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="w-16 h-16 border-t-4 border-purple-500 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#F4F0F9] text-gray-800 pt-5">
//       {/* Header */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//         {/* UPDATED BUTTON BEHAVIOR */}
//         <button
//           onClick={() => router.push('/admin/create-event')}
//           className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
//         >
//           + Create Event
//         </button>
//       </div>
      
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <input
//           type="text"
//           placeholder="Search by name or email"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           className="w-full p-3 mb-6 rounded-lg bg-white border"
//         />
//         <div className="mb-4 text-sm text-gray-600">
//           Showing {filteredUsers.length} of {users.length} users
//         </div>
        
//         {/* Users Table */}
//         <div className="bg-white rounded-lg overflow-hidden shadow-lg">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 bg-white">
//                 {filteredUsers.map((user) => (
//                   <tr key={user.id} className="hover:bg-purple-50">
//                     <td className="px-4 py-3 whitespace-nowrap text-sm">{user.name || 'N/A'}</td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm">{user.email || 'N/A'}</td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm">
//                       <button
//                         onClick={() => handleDeleteUser(user.id)}
//                         className="text-red-600 hover:text-red-900 font-medium"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/lib/firebase'; // Import storage
import { collection, getDocs, doc, getDoc, query, where, deleteDoc, orderBy } from 'firebase/firestore'; 
import { ref, deleteObject } from "firebase/storage"; // Import storage delete function

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [events, setEvents] = useState([]); // ++ NEW: State for events
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');

  // Effect to check admin role
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    const checkAdminRole = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          router.push('/');
        }
      }
    };
    if (!authLoading) checkAdminRole();
  }, [user, authLoading, router]);

  // Effect to fetch both users and events once admin status is confirmed
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch users
        const usersCollection = collection(db, 'users');
        const userQuery = query(usersCollection, where("role", "!=", "admin"));
        const userSnapshot = await getDocs(userQuery);
        const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
        setFilteredUsers(usersList);

        // ++ NEW: Fetch events
        const eventsCollection = collection(db, 'casting_events');
        const eventQuery = query(eventsCollection, orderBy("createdAt", "desc"));
        const eventSnapshot = await getDocs(eventQuery);
        const eventsList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsList);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);
  
  // Effect to filter users based on search
  useEffect(() => {
    const searchLower = search.toLowerCase();
    const filtered = users.filter(u => {
      const name = u.name || '';
      const email = u.email || '';
      return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
    });
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleDeleteUser = async (userId) => { /* ... (This function remains the same) ... */ };

  // ++ NEW: Function to delete an event and its image
  const handleDeleteEvent = async (event) => {
    if (window.confirm('Are you sure you want to delete this event? This will also delete its image.')) {
      try {
        // Delete the event document from Firestore
        await deleteDoc(doc(db, 'casting_events', event.id));

        // Delete the event image from Firebase Storage
        const imageRef = ref(storage, event.imageUrl);
        await deleteObject(imageRef);
        
        // Update the local state to remove the event from the UI
        setEvents(prevEvents => prevEvents.filter(e => e.id !== event.id));
        alert('Event deleted successfully.');
      } catch (error) {
        console.error("Error deleting event: ", error);
        alert('Failed to delete event.');
      }
    }
  };
  
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F0F9] text-gray-800 pt-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={() => router.push('/admin/create-event')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
          + Create Event
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ++ NEW: Events Table Section ++ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Manage Casting Events</h2>
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-purple-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{event.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(event.date.seconds * 1000).toLocaleDateString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{event.location}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm space-x-4">
                        <button
                          onClick={() => router.push(`/admin/events/${event.id}/applicants`)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Applications
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Users Table Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Manage Users</h2>
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-3 mb-6 rounded-lg bg-white border"
          />
          <div className="mb-4 text-sm text-gray-600">Showing {filteredUsers.length} of {users.length} users</div>
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            {/* ... (Users table JSX remains the same) ... */}
          </div>
        </div>
      </div>
    </div>
  );
}