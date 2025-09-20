import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock, Mail, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const result = await loginUser(formData.email, formData.password);
        if (result.success) {
          login(result.user);
          navigate('/dashboard');
        }
      } else {
        // Registration logic
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        const result = await registerUser(formData.name, formData.email, formData.password);
        if (result.success) {
          login(result.user);
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(isLogin ? 'Login failed' : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <p className="text-center text-white/70">
            {isLogin ? 'Sign in to your AuraLink account' : 'Join AuraLink today'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 focus:border-blue-500"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 focus:border-blue-500"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              {isLoading ? 'Please wait...' : (
                <>
                  {isLogin ? <User className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock authentication functions
async function loginUser(email, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock login - in real app, this would call an API
      const userData = {
        id: 'user_' + Date.now(),
        name: email.split('@')[0],
        preferred_name: email.split('@')[0],
        email: email
      };
      resolve({ success: true, user: userData });
    }, 1000);
  });
}

async function registerUser(name, email, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock registration - in real app, this would call an API
      const userData = {
        id: 'user_' + Date.now(),
        name: name,
        preferred_name: name,
        email: email
      };
      resolve({ success: true, user: userData });
    }, 1000);
  });
}