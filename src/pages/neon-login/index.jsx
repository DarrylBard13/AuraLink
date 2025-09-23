import React from 'react';
import { SignIn } from '@/components/auth/LazyStackAuth';

export default function NeonLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to AuraLink</h2>
          <p className="text-gray-300">Sign in to manage your bills and subscriptions</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl">
          <SignIn />
        </div>
      </div>
    </div>
  );
}