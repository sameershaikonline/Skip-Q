export interface AdminHospital {
  id: string;
  name: string;
  address: string;
  city: string;
  contactNumber: string;
  email: string;
  licenseNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isGovernment?: boolean;
  isEmergency?: boolean;
  currentLiveToken?: string;
}

const globalStore = global as any;
if (!globalStore.__ADMIN_HOSPITALS__) {
  globalStore.__ADMIN_HOSPITALS__ = new Map<string, AdminHospital>();
}

export const getAdminHospitals = (): Map<string, AdminHospital> => globalStore.__ADMIN_HOSPITALS__;
