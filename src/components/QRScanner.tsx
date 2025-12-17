import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, User, Mail, Building2, GraduationCap, Calendar, Hash, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { getStudentByCID, StudentIPFSData } from '@/lib/ipfs';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QRData {
  cid: string;
  addr: string;
  name: string;
  hash: string;
  status: string;
}

export function QRScanner({ isOpen, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [studentData, setStudentData] = useState<StudentIPFSData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen && scanning) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        try {
          scannerRef.current = new Html5QrcodeScanner(
            'qr-reader',
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            },
            false
          );

          scannerRef.current.render(
            async (decodedText) => {
              console.log('QR Code scanned:', decodedText);
              setScanning(false);
              setLoading(true);
              setError(null);

              try {
                const qrData: QRData = JSON.parse(decodedText);
                
                if (qrData.cid) {
                  // Fetch student data from IPFS
                  const data = await getStudentByCID(qrData.cid);
                  if (data) {
                    setStudentData(data);
                  } else {
                    setError('Student data not found in IPFS');
                  }
                } else {
                  setError('Invalid QR code format');
                }
              } catch (e) {
                console.error('Error parsing QR data:', e);
                setError('Invalid QR code data');
              } finally {
                setLoading(false);
              }

              // Stop scanner
              if (scannerRef.current) {
                scannerRef.current.clear();
              }
            },
            (errorMessage) => {
              // Ignore scan errors (they happen frequently during scanning)
            }
          );
        } catch (e) {
          console.error('Error initializing scanner:', e);
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      };
    }
  }, [isOpen, scanning]);

  const handleClose = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (e) {
        // Ignore
      }
    }
    setScanning(true);
    setStudentData(null);
    setError(null);
    onClose();
  };

  const handleScanAgain = () => {
    setScanning(true);
    setStudentData(null);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6 border-b border-border">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Scan Student QR</h2>
                    <p className="text-sm text-muted-foreground">Verify student credentials</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {scanning && (
                  <div className="space-y-4">
                    <div id="qr-reader" className="rounded-xl overflow-hidden" />
                    <p className="text-sm text-muted-foreground text-center">
                      Point your camera at a student QR code
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="py-12 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-muted-foreground">Fetching student data from IPFS...</p>
                  </div>
                )}

                {error && (
                  <div className="py-8 space-y-4">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                        <XCircle className="w-8 h-8 text-destructive" />
                      </div>
                      <p className="text-destructive font-medium">{error}</p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleScanAgain}>
                      Scan Again
                    </Button>
                  </div>
                )}

                {studentData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Verification Status */}
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${
                      studentData.verificationStatus === 'verified' 
                        ? 'bg-success/10 border border-success/20' 
                        : studentData.verificationStatus === 'rejected'
                        ? 'bg-destructive/10 border border-destructive/20'
                        : 'bg-warning/10 border border-warning/20'
                    }`}>
                      {studentData.verificationStatus === 'verified' ? (
                        <CheckCircle className="w-6 h-6 text-success" />
                      ) : studentData.verificationStatus === 'rejected' ? (
                        <XCircle className="w-6 h-6 text-destructive" />
                      ) : (
                        <QrCode className="w-6 h-6 text-warning" />
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          {studentData.verificationStatus === 'verified' 
                            ? 'Verified Student' 
                            : studentData.verificationStatus === 'rejected'
                            ? 'Rejected'
                            : 'Pending Verification'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {studentData.verifiedAt 
                            ? `Verified on ${new Date(studentData.verifiedAt).toLocaleDateString()}`
                            : 'Awaiting verification'}
                        </p>
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium text-foreground">{studentData.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium text-foreground">{studentData.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">College:</span>
                        <span className="font-medium text-foreground">{studentData.college}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Department:</span>
                        <span className="font-medium text-foreground">{studentData.department}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Graduation:</span>
                        <span className="font-medium text-foreground">{studentData.graduationYear}</span>
                      </div>
                    </div>

                    {/* Resume Hash */}
                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="flex items-start gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Resume Hash (SHA-256)</p>
                          <code className="text-xs font-mono text-foreground break-all">
                            {studentData.resumeHash}
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Address */}
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                      <code className="text-xs font-mono text-foreground break-all">
                        {studentData.walletAddress}
                      </code>
                    </div>

                    <Button variant="outline" className="w-full" onClick={handleScanAgain}>
                      Scan Another
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
