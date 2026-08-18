export interface HospitalRecord {
  id: string;
  name: string;
  address: string;
  city: string;
  contactNumber: string;
  email: string;
  password?: string;
  licenseNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isGovernment?: boolean;
  isEmergency?: boolean;
  currentLiveToken?: string;
  doctors?: Array<{
    id: string;
    name: string;
    specialization: string;
    qualification: string;
    fee: number;
    roomNo: string;
  }>;
}

const CLOUD_OBJECT_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a015cc0e0c4578';

export async function fetchAllHospitals(): Promise<HospitalRecord[]> {
  try {
    const res = await fetch(CLOUD_OBJECT_URL, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.hospitals && Array.isArray(data.data.hospitals)) {
        return data.data.hospitals;
      }
    }
  } catch (err) {
    console.warn('Cloud store fetch error:', err);
  }
  return [];
}

export async function updateLiveTokenInCloud(hospitalId: string, liveToken: string): Promise<boolean> {
  const current = await fetchAllHospitals();
  const updated = current.map((h) =>
    h.id === hospitalId ? { ...h, currentLiveToken: String(liveToken) } : h
  );

  try {
    await fetch(CLOUD_OBJECT_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'skipq_hospitals_cloud',
        data: { hospitals: updated },
      }),
    });
    return true;
  } catch {
    return false;
  }
}
