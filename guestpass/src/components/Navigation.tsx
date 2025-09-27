import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QrCode, Users, Upload, BarChart3, Home as HomeIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: QrCode, label: 'Scan', path: '/scan' },
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Guests', path: '/guests' },
  ];

  return (
    <Card className="p-3 bg-white/70 backdrop-blur border-none shadow-lg shadow-primary/10">
      <div className="grid grid-cols-5 gap-2">
        <Button
          variant={location.pathname === '/home' ? 'default' : 'ghost'}
          size="sm"
          className="flex flex-col h-16 gap-1"
          onClick={() => navigate('/home')}
        >
          <HomeIcon className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Button>
        {navItems.map(({ icon: Icon, label, path }) => (
          <Button
            key={path}
            variant={location.pathname === path ? 'default' : 'ghost'}
            size="sm"
            className="flex flex-col h-16 gap-1"
            onClick={() => navigate(path)}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}