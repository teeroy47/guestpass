import { Layout } from '@/components/Layout';
import { Navigation } from '@/components/Navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Upload, Users, BarChart3, CheckCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Upload,
      title: 'Upload Guests',
      description: 'Import your guest list from CSV or Excel',
      action: () => navigate('/upload'),
      gradient: 'from-primary/20 to-primary/5',
    },
    {
      icon: QrCode,
      title: 'Scan QR Codes',
      description: 'Quick check-in for event attendees',
      action: () => navigate('/scan'),
      gradient: 'from-success/20 to-success/5',
    },
    {
      icon: BarChart3,
      title: 'View Dashboard',
      description: 'Real-time attendance statistics',
      action: () => navigate('/dashboard'),
      gradient: 'from-warning/20 to-warning/5',
    },
    {
      icon: Users,
      title: 'Manage Guests',
      description: 'View and filter guest lists',
      action: () => navigate('/guests'),
      gradient: 'from-accent to-accent/20',
    },
  ];

  return (
    <Layout className="bg-gradient-to-br from-background via-background to-muted/30" requireAuth>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-6 px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 blur-3xl -z-10"></div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium">
                <CheckCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Professional Event Management</span>
                <span className="sm:hidden">Event Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text leading-tight">
                Event Check-In
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed px-2">
                Streamlined guest management for seamless events. Upload, scan, and track attendance in real-time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground px-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Lightning Fast</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full hidden sm:block"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <QrCode className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
              <span>QR Scanning</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full hidden sm:block"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
              <span>Live Analytics</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-3 px-4">
          {features.map(({ icon: Icon, title, description, action, gradient }) => (
            <Card
              key={title}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] border-0 shadow-sm"
              onClick={action}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 sm:p-3 bg-gradient-to-br ${gradient} rounded-lg sm:rounded-xl shadow-sm`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg font-semibold truncate">{title}</CardTitle>
                    <CardDescription className="text-muted-foreground mt-0.5 text-sm">
                      {description}
                    </CardDescription>
                  </div>
                  <div className="opacity-40 flex-shrink-0">
                    <svg width="5" height="8" viewBox="0 0 6 10" fill="none" className="fill-current">
                      <path d="m1 9 4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="pt-2 px-4">
          <Navigation />
        </div>
      </div>
    </Layout>
  );
}