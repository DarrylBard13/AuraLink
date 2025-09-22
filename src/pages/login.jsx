import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SignIn, SignUp } from '@stackframe/react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">
            Welcome to AuraLink
          </CardTitle>
          <p className="text-center text-white/70">
            Sign in or create an account to continue
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-white">
            <SignIn />
          </div>
          <div className="text-center">
            <span className="text-white/70 text-sm">Don't have an account? </span>
          </div>
          <div className="text-white">
            <SignUp />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}