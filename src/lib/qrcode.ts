import QRCode from 'qrcode';

export interface StudentQRData {
  walletAddress: string;
  name: string;
  email: string;
  college: string;
  department: string;
  graduationYear: number;
  resumeHash: string;
  verificationStatus: 'unverified' | 'verified' | 'rejected';
  timestamp: string;
}

// Generate hash from student data
export const generateStudentHash = async (data: StudentQRData): Promise<string> => {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Generate QR code as data URL
export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Generate QR code with student data encoded
export const generateStudentQRCode = async (studentData: StudentQRData, ipfsCid?: string): Promise<{
  qrCodeUrl: string;
  dataHash: string;
  encodedData: string;
}> => {
  // Create a compact version of the data for QR code
  const compactData = {
    cid: ipfsCid || '', // IPFS CID for fetching full data
    addr: studentData.walletAddress,
    name: studentData.name,
    hash: studentData.resumeHash,
    status: studentData.verificationStatus,
    ts: studentData.timestamp,
  };
  
  const encodedData = JSON.stringify(compactData);
  const dataHash = await generateStudentHash(studentData);
  const qrCodeUrl = await generateQRCode(encodedData);
  
  return {
    qrCodeUrl,
    dataHash,
    encodedData,
  };
};

// Decode QR code data
export const decodeStudentQRData = (qrData: string): {
  addr: string;
  name: string;
  hash: string;
  status: string;
  ts: string;
} | null => {
  try {
    return JSON.parse(qrData);
  } catch {
    return null;
  }
};
