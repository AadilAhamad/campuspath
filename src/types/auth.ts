export type UserRole = 'student' | 'teacher' | 'guest';

export type AccountStatus = 'active' | 'pending_approval' | 'rejected';

export interface UserAccount {
  uid: string;
  role: 'student' | 'teacher';
  identifier: string; // Roll number (Student) or Faculty ID (Teacher) in UPPERCASE
  name: string;
  email: string;
  department?: string;
  status: AccountStatus;
  passwordHash: string; // SHA-256 salted hash - NEVER store plain text
  salt: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface UserSession {
  role: UserRole;
  identifier: string; // Roll number for student, Faculty ID for teacher, or "Guest"
  name: string;
  email?: string;
  department?: string;
  loginTime: string;
  status: AccountStatus;
  isPendingApproval?: boolean;
  authProvider: 'firebase' | 'local_secure_vault';
}

export interface StudentSignUpPayload {
  rollNumber: string;
  fullName: string;
  email: string;
  password: string;
  department?: string;
}

export interface TeacherSignUpPayload {
  facultyId: string;
  fullName: string;
  officialEmail: string;
  password: string;
  department?: string;
}

export interface AuthResult {
  success: boolean;
  session?: UserSession;
  account?: UserAccount;
  errorMessage?: string;
  errorCode?: 'UNREGISTERED' | 'INVALID_PASSWORD' | 'PENDING_APPROVAL' | 'DUPLICATE_ID' | 'DUPLICATE_EMAIL' | 'VALIDATION_ERROR' | 'UNKNOWN';
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  feedback: string[];
}
