import { useEffect, useRef, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const successTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSignUp) {
      setConfirmPassword('');
      setConfirmPasswordError('');
      return;
    }

    if (confirmPasswordError && password === confirmPassword) {
      setConfirmPasswordError('');
    }
  }, [isSignUp, password, confirmPassword, confirmPasswordError]);

  const playSuccessTone = () => {
    if (typeof window === 'undefined') return;

    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext) as typeof window.AudioContext | undefined;
      if (!AudioContextClass) return;

      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, context.currentTime);
      oscillator.frequency.linearRampToValueAtTime(659.25, context.currentTime + 0.4);

      gainNode.gain.setValueAtTime(0.001, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.8);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.9);
      oscillator.onended = () => {
        context.close().catch(() => undefined);
      };
    } catch (error) {
      console.warn('Unable to play success tone', error);
    }
  };

  const triggerSuccessFeedback = () => {
    if (typeof window === 'undefined') return;

    playSuccessTone();
    setShowSuccessOverlay(true);

    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current);
    }

    successTimeoutRef.current = window.setTimeout(() => {
      setShowSuccessOverlay(false);
      navigate('/home');
    }, 1200);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    setConfirmPasswordError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Account created!',
          description: 'Welcome to GuestPass.',
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
      }

      triggerSuccessFeedback();
    } catch (error: any) {
      toast({
        title: 'Authentication failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({
        title: 'Welcome!',
        description: 'Successfully signed in with Google.',
      });
      triggerSuccessFeedback();
    } catch (error: any) {
      toast({
        title: 'Google sign-in failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAuthMode = () => {
    setIsSignUp((prev) => !prev);
    setConfirmPassword('');
    setConfirmPasswordError('');
  };

  return (
    <Layout className="bg-gradient-to-br from-background via-background to-muted/30 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Welcome to GuestPass</h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-sm text-destructive">{confirmPasswordError}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="mr-3 h-4 w-4"
              />
              Continue with Google
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleToggleAuthMode}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 animate-[pulse_1.5s_ease-in-out_infinite]">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground">Authenticated</p>
            <p className="text-sm text-muted-foreground">Welcome to GuestPass</p>
          </div>
        </div>
      )}
    </Layout>
  );
}