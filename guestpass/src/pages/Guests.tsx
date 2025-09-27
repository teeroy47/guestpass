import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Filter, Download } from 'lucide-react';
import QRCode from 'react-qr-code';

interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'checked_in';
  checkInTime?: string;
}

export default function Guests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'checked_in'>('all');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Mock guest data
  const allGuests: Guest[] = [
    {
      id: 'guest-001',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'checked_in',
      checkInTime: '2024-01-15 14:30:00',
    },
    {
      id: 'guest-002',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'checked_in',
      checkInTime: '2024-01-15 14:25:00',
    },
    {
      id: 'guest-003',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'pending',
    },
    {
      id: 'guest-004',
      name: 'Alice Brown',
      email: 'alice@example.com',
      status: 'pending',
    },
    {
      id: 'guest-005',
      name: 'Charlie Wilson',
      email: 'charlie@example.com',
      status: 'checked_in',
      checkInTime: '2024-01-15 14:15:00',
    },
  ];

  const filteredGuests = allGuests.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || guest.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const downloadQRCode = (guest: Guest) => {
    // In a real app, you'd generate and download the QR code as an image
    console.log(`Downloading QR code for ${guest.name} (${guest.id})`);
  };

  const downloadGuestList = () => {
    const csvContent = [
      'ID,Name,Email,Status,Check-in Time',
      ...filteredGuests.map(guest => 
        `${guest.id},${guest.name},${guest.email},${guest.status},${guest.checkInTime || 'N/A'}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guest-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: Guest['status']) => {
    switch (status) {
      case 'checked_in':
        return <Badge className="bg-success text-success-foreground">Checked In</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Guest Management</h1>
          <p className="text-muted-foreground">
            View and manage your event guests
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Guests</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={downloadGuestList}
              className="w-full"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download List ({filteredGuests.length} guests)
            </Button>
          </CardContent>
        </Card>

        {/* Guest List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Guests ({filteredGuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                  onClick={() => setSelectedGuest(guest)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{guest.name}</p>
                    <p className="text-xs text-muted-foreground">{guest.email}</p>
                    {guest.checkInTime && (
                      <p className="text-xs text-muted-foreground">
                        Checked in: {new Date(guest.checkInTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(guest.status)}
                  </div>
                </div>
              ))}

              {filteredGuests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No guests found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Guest Detail Modal */}
        {selectedGuest && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Guest Details</CardTitle>
              <CardDescription>QR code and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCode
                    value={selectedGuest.id}
                    size={120}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
                <p className="text-sm font-medium mt-2">{selectedGuest.name}</p>
                <p className="text-xs text-muted-foreground">{selectedGuest.email}</p>
                <p className="text-xs text-muted-foreground">ID: {selectedGuest.id}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadQRCode(selectedGuest)}
                  className="flex-1"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedGuest(null)}
                  className="flex-1"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Navigation />
      </div>
    </Layout>
  );
}