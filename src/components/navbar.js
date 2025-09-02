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
      router.push('/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      <Link href="/" className="font-bold text-xl text-primary">CastingWeb</Link>
      <div className="flex items-center space-x-4">
        {loading ? (
          <div>Loading...</div>
        ) : user ? (
          <>
            <span>Welcome, {user.displayName || user.email}</span>
            <button onClick={handleLogout} className="font-semibold text-red-600">
              Logout
            </button>
          </>
        ) : (
          <div className="space-x-4">
            <Link href="/login" className="font-semibold">Login</Link>
            <Link href="/signup" className="font-semibold bg-primary text-white px-4 py-2 rounded-md">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}