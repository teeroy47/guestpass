import { ReactNode, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  requireAuth?: boolean;
  allowedEmails?: string[];
}

export function Layout({ children, className, requireAuth = false, allowedEmails }: LayoutProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [checkingAuth, setCheckingAuth] = useState(requireAuth);

  useEffect(() => {
    if (!requireAuth) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [requireAuth]);

  useEffect(() => {
    if (!requireAuth || checkingAuth) return;

    if (!user) {
      navigate('/signin');
      return;
    }

    if (allowedEmails && user.email && !allowedEmails.includes(user.email)) {
      navigate('/home');
    }
  }, [requireAuth, checkingAuth, user, allowedEmails, navigate]);

  const shouldHideContent = requireAuth && (checkingAuth || !user || (allowedEmails && user.email && !allowedEmails.includes(user.email)));

  const userEmail = useMemo(() => user?.email ?? null, [user]);

  return (
    <div className={cn('min-h-screen bg-background relative overflow-hidden', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsla(210,100%,94%,0.9),_hsla(217,91%,91%,0.6)_35%,_hsla(214,94%,83%,0.45)_65%,_hsla(217,91%,60%,0.25)_100%)] animate-slowPulse pointer-events-none" aria-hidden="true" />
      <div className="absolute -inset-32 bg-[conic-gradient(from_0deg,_hsla(217,91%,60%,0.08),_hsla(217,91%,91%,0.25),_hsla(217,91%,60%,0.08))] animate-slowSpin opacity-70 pointer-events-none [mask-image:radial-gradient(circle,_white,_transparent_70%)]" aria-hidden="true" />
      <div className="container relative z-10 mx-auto px-4 py-6 max-w-md space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">GuestPass</p>
            {userEmail && (
              <p className="text-xs text-muted-foreground">Signed in as {userEmail}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => auth.signOut().then(() => navigate('/signin'))}
              >
                Sign out
              </Button>
            )}
          </div>
        </header>
        <div className="bg-background/70 backdrop-blur-md rounded-2xl shadow-lg border border-border/40 p-4">
          {shouldHideContent ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading...</div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}