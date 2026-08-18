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

export async function saveHospital(hospital: HospitalRecord): Promise<HospitalRecord[]> {
  const current = await fetchAllHospitals();
  const cleanEmail = hospital.email.toLowerCase().trim();
  const existingIdx = current.findIndex(
    (h) => h.id === hospital.id || h.email?.toLowerCase().trim() === cleanEmail
  );

  let updated: HospitalRecord[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...hospital };
  } else {
    updated = [hospital, ...current];
  }

  try {
    await fetch(CLOUD_OBJECT_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'skipq_hospitals_cloud',
        data: { hospitals: updated },
      }),
    });
  } catch (err) {
    console.error('Cloud store update error:', err);
  }

  return updated;
}

export async function updateHospitalStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED'
): Promise<HospitalRecord[]> {
  const current = await fetchAllHospitals();
  const updated = current.map((h) => (h.id === id ? { ...h, status } : h));

  try {
    await fetch(CLOUD_OBJECT_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'skipq_hospitals_cloud',
        data: { hospitals: updated },
      }),
    });
  } catch {}

  return updated;
}
