import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, BookOpen, Mail, Lock, User } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Username must be at least 2 characters').max(30, 'Username must be less than 30 characters'),
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ email, password, displayName });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string; displayName?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
          if (err.path[0] === 'displayName') fieldErrors.displayName = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !z.string().email().safeParse(email).success) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a password reset link',
        });
        setIsForgotPassword(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Login error',
              description: 'Incorrect email or password',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome!',
            description: 'You have signed in successfully',
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'User exists',
              description: 'This email is already registered. Try signing in.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account created!',
            description: 'Your account has been created successfully',
          });
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl orb-aqua flex items-center justify-center mx-auto mb-4 shadow-aqua relative overflow-hidden group">
            <span className="text-white font-display font-black text-3xl drop-shadow-md">L</span>
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white blur-[0.4px] opacity-90 animate-pulse"></div>
          </div>
          <h1 className="font-display font-black text-3xl text-foreground text-shadow-sm tracking-tight">Luma</h1>
          <p className="text-primary font-bold text-sm mt-0.5">Learn brighter.</p>
        </div>

        <Card className="aero-card rounded-3xl overflow-hidden shadow-aqua border border-white/90">
          <CardHeader className="text-center pb-4 border-b border-white/40 bg-white/30">
            <CardTitle className="font-display font-bold text-xl text-foreground">
              {isForgotPassword ? 'Reset Password' : isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              {isForgotPassword
                ? 'Enter your email to receive a reset link'
                : isLogin
                ? 'Enter your credentials to continue'
                : 'Create an account to save your progress'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-full bg-white/80 border-white/90 shadow-inner h-11"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs font-bold text-destructive">{errors.email}</p>
                  )}
                </div>

                <Button type="submit" className="w-full btn-gel-aqua rounded-full py-6 font-bold text-white shadow-aqua-sm" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    className="text-xs font-bold text-primary hover:underline"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setErrors({});
                    }}
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 rounded-full bg-white/80 border-white/90 shadow-inner h-11"
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs font-bold text-destructive">{errors.email}</p>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <Input
                          id="displayName"
                          type="text"
                          placeholder="Your username"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="pl-10 rounded-full bg-white/80 border-white/90 shadow-inner h-11"
                          disabled={loading}
                        />
                      </div>
                      {errors.displayName && (
                        <p className="text-xs font-bold text-destructive">{errors.displayName}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                      {isLogin && (
                        <button
                          type="button"
                          className="text-xs font-bold text-primary hover:underline"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setErrors({});
                          }}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 rounded-full bg-white/80 border-white/90 shadow-inner h-11"
                        disabled={loading}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-xs font-bold text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full btn-gel-aqua rounded-full py-6 font-bold text-white shadow-aqua-sm text-sm" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                      setDisplayName('');
                    }}
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : 'Already have an account? Sign in'}
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
