import { 
  UserAccount, 
  UserSession, 
  StudentSignUpPayload, 
  TeacherSignUpPayload, 
  AuthResult, 
  PasswordStrength 
} from '../types/auth';

const STORAGE_ACCOUNTS_KEY = 'necn_campuspath_accounts_vault_v1';
const STORAGE_SESSION_KEY = 'necn_campuspath_session_v1';

// Cryptographic helpers using standard Web Crypto API
async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:${password}`);
}

// Initial pre-seeded accounts for immediate testing and verification
const INITIAL_SEEDED_ACCOUNTS: UserAccount[] = [
  {
    uid: 'stud_seed_21711a0501',
    role: 'student',
    identifier: '21711A0501',
    name: 'K. Sravan Kumar',
    email: '21711a0501@necn.ac.in',
    department: 'Computer Science & Engineering',
    status: 'active',
    salt: 'seed_salt_student_01',
    // Pre-computed hash of "seed_salt_student_01:Student@123"
    passwordHash: '8cb3d790dca4ae37df8c089da762bf6a9686008b260fc90f5a34bb22616238b9',
    createdAt: '2025-01-15T09:00:00.000Z'
  },
  {
    uid: 'fac_seed_necn_fac_101',
    role: 'teacher',
    identifier: 'NECN-FAC-101',
    name: 'Dr. P. Suresh (CSE HOD)',
    email: 'suresh.p@necn.ac.in',
    department: 'Computer Science & Engineering',
    status: 'active', // Pre-approved faculty
    salt: 'seed_salt_faculty_01',
    // Pre-computed hash of "seed_salt_faculty_01:Faculty@123"
    passwordHash: '1970b8a4fcf37887556f8f01b33ce2bcfae0ea05dcf31bf27fc1719c968f9aee',
    createdAt: '2025-01-10T08:30:00.000Z',
    approvedAt: '2025-01-10T10:00:00.000Z',
    approvedBy: 'Academic Principal Office'
  },
  {
    uid: 'fac_seed_necn_fac_999',
    role: 'teacher',
    identifier: 'NECN-FAC-999',
    name: 'Prof. R. Anitha (ECE)',
    email: 'anitha.r@necn.ac.in',
    department: 'Electronics & Communication Engineering',
    status: 'pending_approval', // Deliberately pending to test unapproved faculty restriction
    salt: 'seed_salt_faculty_02',
    // Pre-computed hash of "seed_salt_faculty_02:Pending@123"
    passwordHash: '39a2b53580455d3b37ea309ca0c5980004ff4fe27fa977bca74e2d26f634b3f8',
    createdAt: '2025-02-01T11:20:00.000Z'
  }
];

class AuthService {
  private accounts: UserAccount[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.accounts = parsed;
            this.isInitialized = true;
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to parse accounts vault', e);
      }
      this.accounts = [...INITIAL_SEEDED_ACCOUNTS];
      this.saveAccounts();
    } else {
      this.accounts = [...INITIAL_SEEDED_ACCOUNTS];
    }
    this.isInitialized = true;
  }

  private saveAccounts() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(this.accounts));
      } catch (e) {
        console.warn('Failed to save accounts to vault', e);
      }
    }
  }

  /**
   * Evaluate password strength with comprehensive checks
   */
  public evaluatePasswordStrength(password: string): PasswordStrength {
    let score = 0;
    const feedback: string[] = [];

    if (!password) {
      return { score: 0, label: 'Very Weak', feedback: ['Password is required'] };
    }

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Use at least 8 characters');
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include both uppercase and lowercase letters');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include at least one number');
    }

    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include at least one special character (e.g. @, #, $, !)');
    }

    let label: PasswordStrength['label'] = 'Very Weak';
    if (score === 1) label = 'Weak';
    else if (score === 2) label = 'Fair';
    else if (score === 3) label = 'Strong';
    else if (score === 4) label = 'Very Strong';

    return { score, label, feedback };
  }

  /**
   * Register a new student
   * Roll number is normalized to uppercase and used as the unique account identifier
   */
  public async registerStudent(payload: StudentSignUpPayload): Promise<AuthResult> {
    this.init();
    const rollUpper = payload.rollNumber.trim().toUpperCase();
    const emailClean = payload.email.trim().toLowerCase();

    // 1. Validation checks
    if (!rollUpper || rollUpper.length < 8 || rollUpper.length > 12) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Roll Number must be between 8 and 12 characters (e.g., 21711A0501).'
      };
    }

    if (!payload.fullName.trim() || payload.fullName.trim().length < 3) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Full Name must be at least 3 characters.'
      };
    }

    if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Please enter a valid email address.'
      };
    }

    const strength = this.evaluatePasswordStrength(payload.password);
    if (strength.score < 2) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: `Password too weak. ${strength.feedback.join('. ')}`
      };
    }

    // 2. Duplicate checking
    const existingById = this.accounts.find(
      a => a.identifier.toUpperCase() === rollUpper
    );
    if (existingById) {
      return {
        success: false,
        errorCode: 'DUPLICATE_ID',
        errorMessage: `An account is already registered with Roll Number ${rollUpper}. Please log in.`
      };
    }

    const existingByEmail = this.accounts.find(
      a => a.email.toLowerCase() === emailClean
    );
    if (existingByEmail) {
      return {
        success: false,
        errorCode: 'DUPLICATE_EMAIL',
        errorMessage: `The email address ${emailClean} is already registered. Please log in or use a different email.`
      };
    }

    // 3. Cryptographic Salting & Hashing
    const salt = generateSalt();
    const passwordHash = await hashPasswordWithSalt(payload.password, salt);

    const newAccount: UserAccount = {
      uid: `stud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'student',
      identifier: rollUpper,
      name: payload.fullName.trim(),
      email: emailClean,
      department: payload.department || 'Undergraduate Engineering',
      status: 'active', // Students are activated immediately
      passwordHash,
      salt,
      createdAt: new Date().toISOString()
    };

    this.accounts.push(newAccount);
    this.saveAccounts();

    const session: UserSession = {
      role: 'student',
      identifier: newAccount.identifier,
      name: newAccount.name,
      email: newAccount.email,
      department: newAccount.department,
      loginTime: new Date().toISOString(),
      status: 'active',
      authProvider: 'local_secure_vault'
    };

    return {
      success: true,
      session,
      account: newAccount
    };
  }

  /**
   * Register a new teacher
   * Teacher accounts are strictly created with status: 'pending_approval'
   * They must NOT be granted teacher privileges immediately upon registration!
   */
  public async registerTeacher(payload: TeacherSignUpPayload): Promise<AuthResult> {
    this.init();
    const facultyIdUpper = payload.facultyId.trim().toUpperCase();
    const emailClean = payload.officialEmail.trim().toLowerCase();

    // 1. Validation checks
    if (!facultyIdUpper || facultyIdUpper.length < 5) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Faculty ID must be at least 5 characters (e.g., NECN-FAC-104).'
      };
    }

    if (!payload.fullName.trim() || payload.fullName.trim().length < 3) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Full Name must be at least 3 characters.'
      };
    }

    if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Please enter a valid official institutional email address.'
      };
    }

    const strength = this.evaluatePasswordStrength(payload.password);
    if (strength.score < 2) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: `Password too weak. ${strength.feedback.join('. ')}`
      };
    }

    // 2. Duplicate checking
    const existingById = this.accounts.find(
      a => a.identifier.toUpperCase() === facultyIdUpper
    );
    if (existingById) {
      return {
        success: false,
        errorCode: 'DUPLICATE_ID',
        errorMessage: `An account is already registered with Faculty ID ${facultyIdUpper}.`
      };
    }

    const existingByEmail = this.accounts.find(
      a => a.email.toLowerCase() === emailClean
    );
    if (existingByEmail) {
      return {
        success: false,
        errorCode: 'DUPLICATE_EMAIL',
        errorMessage: `The official email ${emailClean} is already registered.`
      };
    }

    // 3. Cryptographic Salting & Hashing
    const salt = generateSalt();
    const passwordHash = await hashPasswordWithSalt(payload.password, salt);

    // CRITICAL: Teacher accounts are marked 'pending_approval' to satisfy the strict security rule:
    // "Teacher accounts must be verified or approved before being granted teacher privileges.
    // Do not let a user become a teacher simply by selecting Teacher during registration."
    const newAccount: UserAccount = {
      uid: `fac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'teacher',
      identifier: facultyIdUpper,
      name: payload.fullName.trim(),
      email: emailClean,
      department: payload.department || 'Academic Faculty Staff',
      status: 'pending_approval',
      passwordHash,
      salt,
      createdAt: new Date().toISOString()
    };

    this.accounts.push(newAccount);
    this.saveAccounts();

    return {
      success: true,
      account: newAccount,
      errorCode: 'PENDING_APPROVAL',
      errorMessage: 'Faculty account registered successfully. Verification required before teacher privileges are unlocked.'
    };
  }

  /**
   * Authenticate student with Roll Number & Password
   */
  public async loginStudent(rollNumber: string, password: string): Promise<AuthResult> {
    this.init();
    const rollUpper = rollNumber.trim().toUpperCase();

    if (!rollUpper) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Please enter your Student Roll Number.'
      };
    }

    const account = this.accounts.find(
      a => a.role === 'student' && a.identifier.toUpperCase() === rollUpper
    );

    if (!account) {
      return {
        success: false,
        errorCode: 'UNREGISTERED',
        errorMessage: `No student account found with Roll Number "${rollUpper}". Please create an account first.`
      };
    }

    // Verify password hash
    const computedHash = await hashPasswordWithSalt(password, account.salt);
    if (computedHash !== account.passwordHash) {
      return {
        success: false,
        errorCode: 'INVALID_PASSWORD',
        errorMessage: 'Incorrect password. Please verify and try again.'
      };
    }

    const session: UserSession = {
      role: 'student',
      identifier: account.identifier,
      name: account.name,
      email: account.email,
      department: account.department,
      loginTime: new Date().toISOString(),
      status: account.status,
      authProvider: 'local_secure_vault'
    };

    return {
      success: true,
      session,
      account
    };
  }

  /**
   * Authenticate teacher with Faculty ID & Password
   */
  public async loginTeacher(facultyId: string, password: string): Promise<AuthResult> {
    this.init();
    const facultyIdUpper = facultyId.trim().toUpperCase();

    if (!facultyIdUpper) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Please enter your Faculty ID.'
      };
    }

    const account = this.accounts.find(
      a => a.role === 'teacher' && a.identifier.toUpperCase() === facultyIdUpper
    );

    if (!account) {
      return {
        success: false,
        errorCode: 'UNREGISTERED',
        errorMessage: `No faculty account found with Faculty ID "${facultyIdUpper}". Please register your official profile.`
      };
    }

    // Verify password hash
    const computedHash = await hashPasswordWithSalt(password, account.salt);
    if (computedHash !== account.passwordHash) {
      return {
        success: false,
        errorCode: 'INVALID_PASSWORD',
        errorMessage: 'Incorrect password. Please check your credentials.'
      };
    }

    // Check approval status
    if (account.status === 'pending_approval') {
      const pendingSession: UserSession = {
        role: 'teacher',
        identifier: account.identifier,
        name: account.name,
        email: account.email,
        department: account.department,
        loginTime: new Date().toISOString(),
        status: 'pending_approval',
        isPendingApproval: true,
        authProvider: 'local_secure_vault'
      };

      return {
        success: false,
        session: pendingSession,
        account,
        errorCode: 'PENDING_APPROVAL',
        errorMessage: `Account Pending Verification: Your faculty registration (${account.identifier}) is currently awaiting administrative approval from the college Dean / Principal's office.`
      };
    }

    const session: UserSession = {
      role: 'teacher',
      identifier: account.identifier,
      name: account.name,
      email: account.email,
      department: account.department,
      loginTime: new Date().toISOString(),
      status: 'active',
      isPendingApproval: false,
      authProvider: 'local_secure_vault'
    };

    return {
      success: true,
      session,
      account
    };
  }

  /**
   * Administrative approval action for faculty accounts
   * Enables demonstration and verification of both unapproved and approved flows
   */
  public approveTeacher(facultyId: string, approvedBy = 'Administrator (Principal Office)'): boolean {
    this.init();
    const facultyIdUpper = facultyId.trim().toUpperCase();
    const accountIndex = this.accounts.findIndex(
      a => a.role === 'teacher' && a.identifier.toUpperCase() === facultyIdUpper
    );

    if (accountIndex >= 0) {
      this.accounts[accountIndex] = {
        ...this.accounts[accountIndex],
        status: 'active',
        approvedAt: new Date().toISOString(),
        approvedBy
      };
      this.saveAccounts();
      return true;
    }
    return false;
  }

  /**
   * Password reset for forgotten credentials
   */
  public async resetPassword(identifier: string, email: string, newPass: string): Promise<AuthResult> {
    this.init();
    const idUpper = identifier.trim().toUpperCase();
    const emailClean = email.trim().toLowerCase();

    const accountIndex = this.accounts.findIndex(
      a => a.identifier.toUpperCase() === idUpper && a.email.toLowerCase() === emailClean
    );

    if (accountIndex < 0) {
      return {
        success: false,
        errorCode: 'UNREGISTERED',
        errorMessage: 'No matching account found with the provided Roll Number/Faculty ID and registered email.'
      };
    }

    const strength = this.evaluatePasswordStrength(newPass);
    if (strength.score < 2) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: `New password too weak. ${strength.feedback.join('. ')}`
      };
    }

    const salt = generateSalt();
    const passwordHash = await hashPasswordWithSalt(newPass, salt);

    this.accounts[accountIndex] = {
      ...this.accounts[accountIndex],
      salt,
      passwordHash
    };
    this.saveAccounts();

    return {
      success: true,
      account: this.accounts[accountIndex]
    };
  }

  /**
   * Get all registered accounts (omits sensitive hashes)
   */
  public getRegisteredAccountsSummary() {
    this.init();
    return this.accounts.map(a => ({
      uid: a.uid,
      role: a.role,
      identifier: a.identifier,
      name: a.name,
      email: a.email,
      department: a.department,
      status: a.status,
      createdAt: a.createdAt,
      approvedAt: a.approvedAt,
      approvedBy: a.approvedBy
    }));
  }
}

export const authService = new AuthService();
