export type BiometricStatus = 'Registered' | 'Not Registered' | 'Pending Verification';
export type AccountStatus = 'Active' | 'Suspended' | 'Disabled' | 'Under Review';

export interface DemoNidRecord {
  id: string | number;
  nid?: string;
  demo_nid_number?: string;
  record_id?: string;
  name: string;
  date_of_birth: string;
  gender?: string;
  address: string;
  contact_number?: string;
  blood_group?: string;
  father_name?: string;
  mother_name?: string;
  fingerprint_id?: number | null;
  fingerprint_template_id?: number | null;
  face_registered?: number | boolean;
  biometric_status: BiometricStatus;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
  last_access?: string | null;
  access_count: number;
  encryption_algorithm?: string;
  key_version?: string;
  is_synthetic?: boolean;
}

export interface NidFilterOptions {
  search?: string;
  biometricStatus?: BiometricStatus | 'All';
  accountStatus?: AccountStatus | 'All';
  sortBy?: 'name' | 'created_at' | 'nid';
  sortOrder?: 'asc' | 'desc';
}
