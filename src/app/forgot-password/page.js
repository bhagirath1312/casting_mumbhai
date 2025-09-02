"use client";
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
     <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleReset} className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        {message && <p className="text-green-500 text-center">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
        </div>
        <button type="submit" className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md">Send Reset Link</button>
        <p className="text-center"><Link href="/login" className="text-indigo-600">Back to Login</Link></p>
      </form>
    </div>
  );
}