"use client";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      <Link href="/" className="font-bold text-xl text-primary">
        Casting Mumbhai
      </Link>
      <div className="flex items-center space-x-4">
        {/* While loading, show a placeholder */}
        {loading && <div>Loading...</div>}

        {/* If not loading and user exists, show profile/logout */}
        {!loading && user ? (
          <>
            <Link href="/profile" className="font-semibold">
              Welcome, {user.displayName || user.email}
            </Link>
            <button onClick={handleLogout} className="font-semibold text-red-600">
              Logout
            </button>
          </>
        ) : null}

        {/* If not loading and no user, show login/signup */}
        {!loading && !user ? (
          <div className="space-x-4">
            <Link href="/login" className="font-semibold">Login</Link>
            <Link href="/signup" className="font-semibold bg-indigo-600 text-white px-4 py-2 rounded-md">
              Sign Up
            </Link>
          </div>
        ) : null}
      </div>
    </nav>
  );
}