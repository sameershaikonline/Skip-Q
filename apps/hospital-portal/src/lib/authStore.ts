export interface HospitalAccount {
  id: string;
  hospitalName: string;
  email: string;
  passwordHash: string; // Plain/hash for checking
  city: string;
  contactNumber: string;
  status: 'APPROVED' | 'PENDING' | 'SUSPENDED';
}

const globalStore = global as any;

if (!globalStore.__HOSPITAL_ACCOUNTS__) {
  globalStore.__HOSPITAL_ACCOUNTS__ = new Map<string, HospitalAccount>();
}

export const getHospitalAccounts = (): Map<string, HospitalAccount> =>
  globalStore.__HOSPITAL_ACCOUNTS__;

export const registerHospitalAccount = (account: HospitalAccount) => {
  const store = getHospitalAccounts();
  store.set(account.email.toLowerCase().trim(), account);
};

export const findHospitalAccountByEmail = (email: string): HospitalAccount | undefined => {
  const store = getHospitalAccounts();
  return store.get(email.toLowerCase().trim());
};
