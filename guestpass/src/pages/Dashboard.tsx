import { Layout } from '@/components/Layout';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Clock, Download, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  // Mock data - in real app this would come from backend
  const stats = {
    totalGuests: 150,
    checkedIn: 89,
    pending: 61,
    checkInRate: 59.3,
  };

  const recentActivity = [
    { id: 1, name: 'John Doe', time: '2 minutes ago', status: 'checked_in' },
    { id: 2, name: 'Jane Smith', time: '5 minutes ago', status: 'checked_in' },
    { id: 3, name: 'Bob Johnson', time: '8 minutes ago', status: 'checked_in' },
    { id: 4, name: 'Alice Brown', time: '12 minutes ago', status: 'checked_in' },
    { id: 5, name: 'Charlie Wilson', time: '15 minutes ago', status: 'checked_in' },
  ];

  const exportAttendanceReport = () => {
    // Mock CSV export
    const csvContent = [
      'Name,Email,Status,Check-in Time',
      'John Doe,john@example.com,Checked In,2024-01-15 14:30:00',
      'Jane Smith,jane@example.com,Checked In,2024-01-15 14:25:00',
      'Bob Johnson,bob@example.com,Pending,-',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Event Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time attendance overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Total Guests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGuests}</div>
              <p className="text-xs text-muted-foreground">Invited to event</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-success" />
                Checked In
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.checkedIn}</div>
              <p className="text-xs text-muted-foreground">
                {stats.checkInRate}% attendance rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Not yet arrived</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.checkInRate}%</div>
              <p className="text-xs text-muted-foreground">Check-in success</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Check-in Progress</CardTitle>
            <CardDescription>
              {stats.checkedIn} of {stats.totalGuests} guests have checked in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.checkInRate}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0%</span>
              <span>{stats.checkInRate}%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Check-ins</CardTitle>
            <CardDescription>Latest guest arrivals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <div>
                      <p className="text-sm font-medium">{activity.name}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    Checked In
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Button */}
        <Button
          onClick={exportAttendanceReport}
          variant="outline"
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Attendance Report
        </Button>

        <Navigation />
      </div>
    </Layout>
  );
}