"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect to homepage after login
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    // Your login form JSX here...
    // Make sure it calls handleLogin on submit and has a link to /forgot-password
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
         <h1 className="text-2xl font-bold text-center">Login</h1>
         {error && <p className="text-red-500 text-center">{error}</p>}
          {/* Email Input */}
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
        </div>
        {/* Password Input */}
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
        </div>
        <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-indigo-600">Forgot Password?</Link>
        </div>
        <button type="submit" className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md">Login</button>
        <p className="text-center">Don't have an account? <Link href="/signup" className="text-indigo-600">Sign Up</Link></p>
      </form>
    </div>
  );
}