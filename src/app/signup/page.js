"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user's profile with name
      await updateProfile(user, { displayName: name });
      
      // Create a user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: user.email,
        role: "talent", // default role
      });
      
      router.push('/profile'); // Redirect to homepage after signup
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    // Your signup form JSX here...
    // Make sure your form calls handleSignup on submit
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSignup} className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Create an Account</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {/* Name Input */}
        <div>
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
        </div>
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
        <button type="submit" className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md">Sign Up</button>
        <p className="text-center">Already have an account? <Link href="/login" className="text-indigo-600">Login</Link></p>
      </form>
    </div>
  );
}