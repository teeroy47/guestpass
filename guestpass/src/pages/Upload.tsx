import { useState, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, Users, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { callCreateInvite, type CreateInvitePayload, type CreateInviteResult } from '@/lib/firebase';
import { useMutation } from '@tanstack/react-query';

interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'checked_in';
  timestamp?: string;
}

export default function UploadPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sendingInvites, setSendingInvites] = useState(false);
  const { toast } = useToast();

  const inviteMutation = useMutation({
    mutationFn: async (guest: Guest) => {
      const payload: CreateInvitePayload = {
        guest: {
          name: guest.name,
          email: guest.email,
        },
      };

      const result = await callCreateInvite(payload);
      return result.data as CreateInviteResult;
    },
    onSuccess: (data) => {
      toast({
        title: 'Invite created',
        description: `Sent invite to ${data.guest.name}`,
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to create invite. Please try again.';
      toast({
        title: 'Invite failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV file",
      });
      return;
    }

    setUploading(true);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const parsedGuests: Guest[] = results.data
            .filter((row: any) => row.name && row.email)
            .map((row: any, index: number) => ({
              id: row.id || `guest-${Date.now()}-${index}`,
              name: row.name?.trim(),
              email: row.email?.trim(),
              status: 'pending' as const,
            }));

          if (parsedGuests.length === 0) {
            toast({
              variant: "destructive",
              title: "No valid data found",
              description: "Make sure your CSV has 'name' and 'email' columns",
            });
            return;
          }

          setGuests(parsedGuests);
          toast({
            title: "Upload successful",
            description: `Imported ${parsedGuests.length} guests`,
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error parsing file",
            description: "Please check your CSV format",
          });
        } finally {
          setUploading(false);
        }
      },
      error: () => {
        toast({
          variant: "destructive",
          title: "Error reading file",
          description: "Please try again",
        });
        setUploading(false);
      },
    });
  }, [toast]);

  const handleCreateInvites = async () => {
    if (guests.length === 0) {
      toast({
        title: 'No guests imported',
        description: 'Upload a guest list before sending invites.',
      });
      return;
    }

    try {
      setSendingInvites(true);

      for (const guest of guests) {
        // Await sequentially to keep load manageable and provide feedback per guest
        // Errors are surfaced through the mutation's onError handler
        // eslint-disable-next-line no-await-in-loop
        await inviteMutation.mutateAsync(guest);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'At least one invite failed to send.';
      toast({
        title: 'Send failed',
        description: message,
        variant: 'destructive',
      });
      return;
    } finally {
      setSendingInvites(false);
    }

    toast({
      title: 'Invites sent',
      description: `Dispatched ${guests.length} invite${guests.length > 1 ? 's' : ''}.`,
    });
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      { id: 'guest-001', name: 'John Doe', email: 'john@example.com' },
      { id: 'guest-002', name: 'Jane Smith', email: 'jane@example.com' },
      { id: 'guest-003', name: 'Bob Johnson', email: 'bob@example.com' },
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-guest-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Upload Guest List</h1>
          <p className="text-muted-foreground">
            Import your guest list from a CSV file
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Guests
            </CardTitle>
            <CardDescription>
              Upload a CSV file with columns: id, name, email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select CSV File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>

            <Button
              variant="outline"
              onClick={downloadSampleCSV}
              className="w-full"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {guests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Imported Guests ({guests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {guests.slice(0, 10).map((guest) => (
                  <div key={guest.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium text-sm">{guest.name}</p>
                      <p className="text-xs text-muted-foreground">{guest.email}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {guest.id}
                    </div>
                  </div>
                ))}
                {guests.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground">
                    And {guests.length - 10} more guests...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Navigation />
      </div>
    </Layout>
  );
}