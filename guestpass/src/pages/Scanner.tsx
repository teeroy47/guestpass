import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';

type ScanResult = {
  id: string;
  status: 'success' | 'already_used' | 'invalid';
  message: string;
  guestName?: string;
  timestamp: string;
};

export default function Scanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const { toast } = useToast();

  // Mock guest database - in real app this would come from backend
  const mockGuests = [
    { id: 'guest-001', name: 'John Doe', email: 'john@example.com', checkedIn: false },
    { id: 'guest-002', name: 'Jane Smith', email: 'jane@example.com', checkedIn: false },
    { id: 'guest-003', name: 'Bob Johnson', email: 'bob@example.com', checkedIn: true },
  ];

  const processQRCode = (data: string) => {
    const timestamp = new Date().toLocaleTimeString();
    
    // Find guest in mock database
    const guest = mockGuests.find(g => g.id === data);
    
    if (!guest) {
      const result: ScanResult = {
        id: data,
        status: 'invalid',
        message: 'Invalid QR code',
        timestamp,
      };
      setLastResult(result);
      setScanHistory(prev => [result, ...prev.slice(0, 9)]);
      toast({
        variant: "destructive",
        title: "Invalid QR Code",
        description: "This code is not in our guest list",
      });
      return;
    }

    if (guest.checkedIn) {
      const result: ScanResult = {
        id: data,
        status: 'already_used',
        message: 'Already checked in',
        guestName: guest.name,
        timestamp,
      };
      setLastResult(result);
      setScanHistory(prev => [result, ...prev.slice(0, 9)]);
      toast({
        variant: "destructive",
        title: "Already Checked In",
        description: `${guest.name} has already been checked in`,
      });
      return;
    }

    // Success case
    guest.checkedIn = true; // Update mock data
    const result: ScanResult = {
      id: data,
      status: 'success',
      message: 'Successfully checked in',
      guestName: guest.name,
      timestamp,
    };
    setLastResult(result);
    setScanHistory(prev => [result, ...prev.slice(0, 9)]);
    toast({
      title: "Check-in Successful",
      description: `${guest.name} has been checked in`,
    });
  };

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => processQRCode(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'back',
        }
      );

      qrScannerRef.current = scanner;
      await scanner.start();
      setIsScanning(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
      });
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const getStatusIcon = (status: ScanResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'already_used':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ScanResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success text-success-foreground">Success</Badge>;
      case 'already_used':
        return <Badge className="bg-warning text-warning-foreground">Used</Badge>;
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">QR Code Scanner</h1>
          <p className="text-muted-foreground">
            Scan guest QR codes for check-in
          </p>
        </div>

        {/* Camera Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Camera Scanner
            </CardTitle>
            <CardDescription>
              Position QR code within the camera viewfinder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                style={{ display: isScanning ? 'block' : 'none' }}
              />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <CameraOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Camera not active</p>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={isScanning ? stopScanning : startScanning}
              variant={isScanning ? "destructive" : "default"}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Scanner
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanner
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Last Result */}
        {lastResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(lastResult.status)}
                  Last Scan
                </span>
                {getStatusBadge(lastResult.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lastResult.guestName && (
                  <p className="font-medium">{lastResult.guestName}</p>
                )}
                <p className="text-sm text-muted-foreground">{lastResult.message}</p>
                <p className="text-xs text-muted-foreground">
                  {lastResult.timestamp} • ID: {lastResult.id}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {scanHistory.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(scan.status)}
                      <div>
                        <p className="text-sm font-medium">
                          {scan.guestName || scan.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {scan.timestamp}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(scan.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Navigation />
      </div>
    </Layout>
  );
}