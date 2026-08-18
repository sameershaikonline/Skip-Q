export interface LiveHospital {
  id: string;
  name: string;
  address: string;
  city: string;
  contactNumber: string;
  email: string;
  openHours: string;
  rating: number;
  reviewCount: number;
  isEmergency: boolean;
  isGovernment: boolean;
  currentLiveToken: string; // Currently active token taking treatment in doctor room
  departments: Array<{ id: string; name: string }>;
  doctors: Array<{
    id: string;
    name: string;
    specialization: string;
    qualification: string;
    experience: string;
    roomNo: string;
    fee: number;
    availableTime: string;
  }>;
}

export interface LiveAppointment {
  id: string;
  hospitalId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointmentDate: string;
  timeSlot: string;
  tokenNumber: string; // e.g. "10", "11", "12"
  status: 'BOOKED' | 'IN_QUEUE' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
}

// Global serverless in-memory shared store for real-time sync across Vercel functions
const globalStore = global as any;

if (!globalStore.__HOSPITAL_STORE__) {
  // Empty initial list — only hospitals registered by management/admin will appear
  globalStore.__HOSPITAL_STORE__ = new Map<string, LiveHospital>();
}

if (!globalStore.__APPOINTMENT_STORE__) {
  globalStore.__APPOINTMENT_STORE__ = new Map<string, LiveAppointment>();
}

export const getHospitalStore = (): Map<string, LiveHospital> => globalStore.__HOSPITAL_STORE__;
export const getAppointmentStore = (): Map<string, LiveAppointment> => globalStore.__APPOINTMENT_STORE__;
