"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, EyeOff, Sparkles, Code, Palette, Zap } from 'lucide-react';
import ApiService from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
      const { user } = await ApiService.login(loginForm.email, loginForm.password);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }

      toast.success('Login successful!');
      onOpenChange(false);
      setLoginForm({ email: '', password: '' });

      setTimeout(async () => {
        let authenticationWorking = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!authenticationWorking && attempts < maxAttempts) {
          try {
            const testResponse = await fetch('/api/auth/profile', {
              credentials: 'include'
            });
            authenticationWorking = testResponse.ok;

            if (!authenticationWorking) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          attempts++;
        }

        onAuthSuccess();
      }, 1000);

    } catch (error) {
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

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }

      toast.success('Registration successful!');
      onOpenChange(false);
      setRegisterForm({ email: '', username: '', password: '', confirmPassword: '' });

      setTimeout(async () => {
        let authenticationWorking = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!authenticationWorking && attempts < maxAttempts) {
          try {
            const testResponse = await fetch('/api/auth/profile', {
              credentials: 'include'
            });
            authenticationWorking = testResponse.ok;

            if (!authenticationWorking) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          attempts++;
        }

        onAuthSuccess();
      }, 1000);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] overflow-hidden p-0 border-none bg-transparent shadow-none">
        {/* Artistic Background Layer */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background via-background to-muted/30 backdrop-blur-2xl border border-white/10">
          {/* Decorative Abstract Shapes - Picasso Style */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-accent/15 to-transparent rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 rotate-45" />
          
          {/* Asymmetrical Border Accents */}
          <div className="absolute top-0 left-0 w-24 h-1 bg-gradient-to-r from-primary via-secondary to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-accent via-primary to-transparent rotate-12 origin-right" />
          <div className="absolute bottom-0 right-0 w-28 h-1 bg-gradient-to-l from-secondary via-accent to-transparent rotate-[-12deg] origin-right" />

          <div className="relative z-10 p-6 sm:p-8">
            {/* Header - Asymmetrical & Artistic */}
            <div className="relative mb-8">
              {/* Rotated Decorative Element */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl rotate-12 blur-sm" />
              
              <div className="relative flex items-start gap-4">
                {/* Logo - Hand-drawn style */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-[-5deg] hover:rotate-0 transition-transform duration-300">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                  {/* Small accent dot */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background" />
                </div>
                
                <div className="flex-1 pt-2">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                    <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Welcome,
                    </span>
                    <br />
                    <span className="text-foreground italic" style={{ transform: 'rotate(-1deg)' }}>
                      Creator
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground/80 italic">
                    Your coding journey begins here
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs - Creative Style */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted/30 backdrop-blur-sm p-1 rounded-2xl border border-white/5 h-12">
                <TabsTrigger 
                  value="login" 
                  className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all font-medium"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-secondary/20 transition-all font-medium"
                >
                  Join Us
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login" className="mt-6 space-y-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium flex items-center gap-2">
                      <Palette className="h-3.5 w-3.5 text-primary" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      autoComplete="email"
                      className="h-12 bg-background/50 border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-secondary" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                        autoComplete="current-password"
                        className="h-12 bg-background/50 border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl pr-12 transition-all"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/5"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                        {error}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-primary via-primary/90 to-secondary hover:from-primary/90 hover:via-primary hover:to-secondary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register" className="mt-6 space-y-6">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium flex items-center gap-2">
                      <Palette className="h-3.5 w-3.5 text-primary" />
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                      autoComplete="email"
                      className="h-12 bg-background/50 border-white/10 focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20 rounded-xl transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-sm font-medium flex items-center gap-2">
                      <Code className="h-3.5 w-3.5 text-accent" />
                      Username
                    </Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a cool username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                      autoComplete="username"
                      className="h-12 bg-background/50 border-white/10 focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20 rounded-xl transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-secondary" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                        autoComplete="new-password"
                        className="h-12 bg-background/50 border-white/10 focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20 rounded-xl pr-12 transition-all"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/5"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password" className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-secondary" />
                      Confirm Password
                    </Label>
                    <Input
                      id="register-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                      autoComplete="new-password"
                      className="h-12 bg-background/50 border-white/10 focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20 rounded-xl transition-all"
                    />
                  </div>

                  {error && (
                    <div className="p-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                        {error}
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-secondary via-secondary/90 to-accent hover:from-secondary/90 hover:via-secondary hover:to-accent/90 text-white font-semibold rounded-xl shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Offline Mode - Artistic Footer */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="text-center space-y-3">
                <p className="text-xs text-muted-foreground/70 italic">
                  Or continue your journey offline
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleOfflineMode} 
                  className="w-full h-11 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl transition-all"
                >
                  <Code className="mr-2 h-4 w-4" />
                  Use Offline Mode
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
