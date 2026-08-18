import { NextResponse } from 'next/server';
import { getHospitalStore, getAppointmentStore } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { liveToken } = await req.json();

    if (!liveToken) {
      return NextResponse.json({ message: 'liveToken value required' }, { status: 400 });
    }

    const hospitalStore = getHospitalStore();
    const hospital = hospitalStore.get(params.id);

    if (hospital) {
      hospital.currentLiveToken = String(liveToken);
      hospitalStore.set(params.id, hospital);
    }

    // Automatically update appointment statuses for this hospital
    const apptStore = getAppointmentStore();
    for (const [apptId, appt] of apptStore.entries()) {
      if (appt.hospitalId === params.id) {
        if (appt.tokenNumber === String(liveToken)) {
          appt.status = 'IN_CONSULTATION';
        } else if (Number(appt.tokenNumber) < Number(liveToken)) {
          appt.status = 'COMPLETED';
        } else {
          appt.status = 'IN_QUEUE';
        }
        apptStore.set(apptId, appt);
      }
    }

    return NextResponse.json({
      message: `Live Token updated to Token #${liveToken} successfully!`,
      currentLiveToken: String(liveToken),
      hospital,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update live token' }, { status: 500 });
  }
}
