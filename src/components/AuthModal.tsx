"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import ApiService from '@/services/api';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: () => void;
}

export default function AuthModal({ open, onOpenChange, onAuthSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginResult = await ApiService.login(loginForm.email, loginForm.password);
      console.log('🔐 Login API success:', loginResult);

      // Clean up old localStorage token if it exists
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }

      toast.success('Login successful!');

      // Close modal first
      onOpenChange(false);

      // Reset form
      setLoginForm({ email: '', password: '' });

      // Wait longer for cookies to be available in browser, then trigger success
      setTimeout(async () => {
        console.log('🍪 Checking cookie availability after login...');

        // Check if cookies are available with more attempts and longer delays
        let cookiesAvailable = false;
        let attempts = 0;
        const maxAttempts = 20; // Increased attempts

        while (!cookiesAvailable && attempts < maxAttempts) {
          cookiesAvailable = ApiService.isAuthenticated();
          console.log(`🍪 Cookie check attempt ${attempts + 1}: ${cookiesAvailable}`);

          if (!cookiesAvailable) {
            await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay
          }
          attempts++;
        }

        if (cookiesAvailable) {
          console.log('✅ Cookies available, triggering auth success');
          onAuthSuccess();
        } else {
          console.log('⚠️  Cookies not available after multiple attempts, triggering anyway');
          onAuthSuccess();
        }
      }, 500); // Increased initial delay

    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await ApiService.register(registerForm.email, registerForm.username, registerForm.password);

      // Clean up old localStorage token if it exists
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }

      toast.success('Registration successful!');

      // Close modal first
      onOpenChange(false);

      // Reset form
      setRegisterForm({ email: '', username: '', password: '', confirmPassword: '' });

      // Call success callback after a brief delay to ensure cookies are set
      setTimeout(() => {
        onAuthSuccess();
      }, 50);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineMode = () => {
    localStorage.setItem('offline-mode', 'true');
    toast.info('Switched to offline mode. Your data will be stored locally.');
    onOpenChange(false);
    onAuthSuccess();
  };

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      toast.success('Logged out successfully!');
      onAuthSuccess(); // Refresh the app state
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2 sm:space-y-3 pb-2">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-lg sm:text-2xl">LC</span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to LeetCode Tracker
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Sign in to sync your progress across devices or continue offline to get started locally.
          </DialogDescription>
          {/* Show upgrade message if user has localStorage data but no cookies */}
          {typeof window !== 'undefined' && (
            localStorage.getItem('auth-token') ||
            localStorage.getItem('leetcode-cf-tracker-problems')
          ) && !document.cookie.includes('auth-token=') && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-blue-800 dark:text-blue-200">
              <strong>Authentication Upgrade:</strong> We've upgraded to a more secure authentication system. Please log in again to access your synced data.
            </div>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 sm:mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="login" className="data-[state=active]:bg-background text-sm sm:text-base">Login</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-background text-sm sm:text-base">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4 sm:mt-6">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-3 sm:pb-4 px-2 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Welcome Back</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Sign in to sync your data across devices
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="login-email" className="text-sm">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="login-password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                        className="h-10 sm:h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-2 sm:p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-10 sm:h-11"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="mt-4 sm:mt-6">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-3 sm:pb-4 px-2 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Create Account</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Join thousands of developers tracking their progress
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="register-email" className="text-sm">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="register-username" className="text-sm">Username</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="register-password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                        className="h-10 sm:h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="register-confirm-password" className="text-sm">Confirm Password</Label>
                    <Input
                      id="register-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>

                  {error && (
                    <div className="p-2 sm:p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-10 sm:h-11" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Or continue without an account
          </p>
          <Button variant="outline" onClick={handleOfflineMode} className="w-full">
            Use Offline Mode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
