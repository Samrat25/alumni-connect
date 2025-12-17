// IPFS Storage using Pinata - REAL IMPLEMENTATION
// Your Pinata API keys

const PINATA_API_KEY = 'fb532782dafafa6706dd';
const PINATA_SECRET_KEY = '5730bca57ae150f6a6d1ad3864693a9cdc15b1f77c9cdacd9aa8e54fc14d7941';
const PINATA_API_URL = 'https://api.pinata.cloud';
// Using public gateway - dedicated gateway has access restrictions
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

// Test function - run testPinataConnection() in browser console to verify
export const testPinataConnection = async () => {
  console.log('🧪 Testing Pinata connection...');
  try {
    const testData = {
      test: true,
      message: 'ChainRefer Pinata Test',
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: JSON.stringify({
        pinataContent: testData,
        pinataMetadata: { name: 'chainrefer_test' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Pinata test failed:', error);
      return { success: false, error };
    }

    const result = await response.json();
    console.log('✅ Pinata connection successful!');
    console.log('📍 Test CID:', result.IpfsHash);
    console.log('🔗 View at:', `${PINATA_GATEWAY}/${result.IpfsHash}`);
    console.log('📊 Check your Pinata dashboard: https://app.pinata.cloud/pinmanager');
    return {
      success: true,
      cid: result.IpfsHash,
      url: `${PINATA_GATEWAY}/${result.IpfsHash}`,
    };
  } catch (error) {
    console.error('❌ Pinata test error:', error);
    return { success: false, error };
  }
};

// Global assignment moved to end of file

export interface StudentIPFSData {
  walletAddress: string;
  name: string;
  email: string;
  college: string;
  department: string;
  graduationYear: number;
  resumeHash: string;
  resumeFileName: string;
  verificationStatus: 'unverified' | 'verified' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface JobIPFSData {
  jobId: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  postedBy: string;
  postedByName: string;
  postedAt: string;
}

// Local cache for faster retrieval
const IPFS_CACHE_KEY = 'chainrefer_ipfs_cache';

const getCache = (): Record<string, any> => {
  const data = localStorage.getItem(IPFS_CACHE_KEY);
  return data ? JSON.parse(data) : {};
};

const setCache = (cid: string, data: any) => {
  const cache = getCache();
  cache[cid] = data;
  localStorage.setItem(IPFS_CACHE_KEY, JSON.stringify(cache));
};

// Upload JSON data to Pinata IPFS - REAL
export const uploadToIPFS = async (data: StudentIPFSData | JobIPFSData): Promise<{
  cid: string;
  url: string;
}> => {
  try {
    console.log('📤 Uploading to Pinata IPFS...');
    
    const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: `chainrefer_${'walletAddress' in data ? 'student' : 'job'}_${Date.now()}`,
          keyvalues: {
            app: 'chainrefer',
            type: 'walletAddress' in data ? 'student' : 'job',
            timestamp: new Date().toISOString(),
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Pinata error:', error);
      throw new Error(error.error?.message || 'Failed to upload to IPFS');
    }

    const result = await response.json();
    const cid = result.IpfsHash;
    
    // Cache locally for faster retrieval
    setCache(cid, data);
    
    console.log('✅ Uploaded to Pinata IPFS!');
    console.log('📍 CID:', cid);
    console.log('🔗 URL:', `${PINATA_GATEWAY}/${cid}`);
    
    return {
      cid,
      url: `${PINATA_GATEWAY}/${cid}`,
    };
  } catch (error) {
    console.error('❌ IPFS upload error:', error);
    throw error;
  }
};

// Upload file (resume) to Pinata IPFS - REAL
export const uploadFileToIPFS = async (file: File): Promise<{
  cid: string;
  url: string;
  hash: string;
}> => {
  try {
    console.log('📤 Uploading file to Pinata IPFS...');
    
    // Generate hash from file content
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
      name: `resume_${file.name}_${Date.now()}`,
      keyvalues: {
        app: 'chainrefer',
        type: 'resume',
        hash: hash,
      }
    }));
    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 1
    }));

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Pinata file upload error:', error);
      throw new Error(error.error?.message || 'Failed to upload file to IPFS');
    }

    const result = await response.json();
    const cid = result.IpfsHash;
    
    console.log('✅ File uploaded to Pinata IPFS!');
    console.log('📍 CID:', cid);
    console.log('🔗 URL:', `${PINATA_GATEWAY}/${cid}`);
    
    return {
      cid,
      url: `${PINATA_GATEWAY}/${cid}`,
      hash,
    };
  } catch (error) {
    console.error('❌ IPFS file upload error:', error);
    throw error;
  }
};

// Retrieve data from IPFS by CID - REAL
export const getFromIPFS = async (cid: string): Promise<any | null> => {
  // Check cache first
  const cache = getCache();
  if (cache[cid]) {
    console.log('📦 Retrieved from cache:', cid);
    return cache[cid];
  }

  try {
    console.log('📥 Fetching from Pinata IPFS:', cid);
    
    const response = await fetch(`${PINATA_GATEWAY}/${cid}`);
    
    if (!response.ok) {
      console.error('❌ Failed to fetch from IPFS:', response.status);
      return null;
    }

    const data = await response.json();
    
    // Cache for future use
    setCache(cid, data);
    
    console.log('✅ Retrieved from IPFS:', cid);
    return data;
  } catch (error) {
    console.error('❌ IPFS fetch error:', error);
    return null;
  }
};

// Get student data by CID
export const getStudentByCID = async (cid: string): Promise<StudentIPFSData | null> => {
  return getFromIPFS(cid);
};

// Get job data by CID
export const getJobByCID = async (cid: string): Promise<JobIPFSData | null> => {
  return getFromIPFS(cid);
};

// Upload student data to IPFS
export const uploadStudentToIPFS = async (studentData: StudentIPFSData): Promise<{
  cid: string;
  url: string;
}> => {
  return uploadToIPFS(studentData);
};

// Upload job data to IPFS
export const uploadJobToIPFS = async (jobData: JobIPFSData): Promise<{
  cid: string;
  url: string;
}> => {
  return uploadToIPFS(jobData);
};

// List all pins from Pinata
export const listPins = async (): Promise<any[]> => {
  try {
    const response = await fetch(
      `${PINATA_API_URL}/data/pinList?status=pinned&metadata[keyvalues][app]={"value":"chainrefer","op":"eq"}`,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to list pins');
    }

    const result = await response.json();
    return result.rows || [];
  } catch (error) {
    console.error('Error listing pins:', error);
    return [];
  }
};

// Make test functions available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).testPinataConnection = testPinataConnection;
  (window as any).listPinataFiles = listPins;
}
