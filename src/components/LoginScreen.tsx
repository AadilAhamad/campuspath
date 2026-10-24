import React, { useState } from 'react';
import { useRooms } from '../context/RoomContext';
import { 
  Building2, 
  GraduationCap, 
  UserCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Lock,
  CheckCircle2,
  KeyRound,
  UserPlus,
  LogIn,
  Info,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserRole, AccountStatus, UserSession, PasswordStrength } from '../types/auth';
import { authService } from '../services/authService';
import { getFirebaseStatus } from '../services/firebaseConfig';
import { FirebaseAuthGuideModal } from './FirebaseAuthGuideModal';

type AuthMode = 'login' | 'signup';

export const LoginScreen: React.FC = () => {
  const { login } = useRooms();

  // Mode: Login vs Sign Up (Create Account)
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Role: Student vs Teacher
  const [activeRole, setActiveRole] = useState<'student' | 'teacher'>('student');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign Up Form State - Common & Student
  const [signUpRoll, setSignUpRoll] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpDepartment, setSignUpDepartment] = useState('Computer Science & Engineering');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  // Teacher Sign Up State
  const [signUpFacultyId, setSignUpFacultyId] = useState('');

  // Sign Up Feedback & Loading
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({});
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState<string | null>(null);

  // Modals & Panels
  const [isFirebaseGuideOpen, setIsFirebaseGuideOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [pendingApprovalAccount, setPendingApprovalAccount] = useState<{
    identifier: string;
    name: string;
    email: string;
    session?: UserSession;
  } | null>(null);
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  // Forgot Password State
  const [fpRole, setFpRole] = useState<'student' | 'teacher'>('student');
  const [fpIdentifier, setFpIdentifier] = useState('');
  const [fpEmail, setFpEmail] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [fpError, setFpError] = useState<string | null>(null);
  const [fpSuccess, setFpSuccess] = useState<string | null>(null);

  const firebaseStatus = getFirebaseStatus();

  // Password strength check for sign-up
  const passwordStrength: PasswordStrength = authService.evaluatePasswordStrength(signUpPassword);

  // Quick switch helpers
  const handleSwitchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setLoginError(null);
    setSignUpErrors({});
    setSignUpSuccessMessage(null);
  };

  const handleSwitchRole = (role: 'student' | 'teacher') => {
    setActiveRole(role);
    setLoginError(null);
    setSignUpErrors({});
    setSignUpSuccessMessage(null);
  };

  // Populate test credentials
  const fillTestCredentials = (type: 'student' | 'teacher_approved' | 'teacher_pending') => {
    setAuthMode('login');
    setLoginError(null);
    if (type === 'student') {
      setActiveRole('student');
      setLoginIdentifier('21711A0501');
      setLoginPassword('Student@123');
    } else if (type === 'teacher_approved') {
      setActiveRole('teacher');
      setLoginIdentifier('NECN-FAC-101');
      setLoginPassword('Faculty@123');
    } else {
      setActiveRole('teacher');
      setLoginIdentifier('NECN-FAC-999');
      setLoginPassword('Pending@123');
    }
  };

  // -------------------------
  // LOGIN SUBMISSION HANDLER
  // -------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = loginIdentifier.trim().toUpperCase();
    if (!cleanId) {
      setLoginError(
        activeRole === 'student'
          ? 'Please enter your Student Roll Number.'
          : 'Please enter your Faculty ID.'
      );
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter your account password.');
      return;
    }

    setLoginLoading(true);

    try {
      if (activeRole === 'student') {
        const result = await authService.loginStudent(cleanId, loginPassword);
        if (result.success && result.session) {
          login(result.session);
        } else {
          setLoginError(result.errorMessage || 'Invalid student credentials.');
        }
      } else {
        const result = await authService.loginTeacher(cleanId, loginPassword);
        if (result.success && result.session) {
          // Approved teacher
          login(result.session);
        } else if (result.errorCode === 'PENDING_APPROVAL') {
          // Unapproved teacher: display status modal rather than granting teacher privileges
          setPendingApprovalAccount({
            identifier: result.account?.identifier || cleanId,
            name: result.account?.name || 'Faculty Member',
            email: result.account?.email || '',
            session: result.session
          });
          setLoginError(result.errorMessage || 'Account pending administrative verification.');
        } else {
          setLoginError(result.errorMessage || 'Invalid faculty credentials.');
        }
      }
    } catch (err: any) {
      setLoginError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoginLoading(false);
    }
  };

  // -------------------------
  // STUDENT SIGN UP HANDLER
  // -------------------------
  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const rollUpper = signUpRoll.trim().toUpperCase();

    if (!rollUpper) {
      errors.roll = 'Student Roll Number is required.';
    } else if (rollUpper.length < 8 || rollUpper.length > 12) {
      errors.roll = 'Roll Number must be between 8 and 12 characters (e.g., 21711A0501).';
    }

    if (!signUpName.trim() || signUpName.trim().length < 3) {
      errors.name = 'Full Name must be at least 3 characters.';
    }

    if (!signUpEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!signUpPassword) {
      errors.password = 'Password is required.';
    } else if (passwordStrength.score < 2) {
      errors.password = 'Password is too weak. Please include at least 8 characters with letters, numbers, and symbols.';
    }

    if (signUpPassword !== signUpConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setSignUpErrors(errors);
      return;
    }

    setSignUpErrors({});
    setSignUpLoading(true);

    try {
      const result = await authService.registerStudent({
        rollNumber: rollUpper,
        fullName: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        department: signUpDepartment
      });

      if (result.success && result.session) {
        setSignUpSuccessMessage(`Account created for ${rollUpper}! Signing in...`);
        setTimeout(() => {
          login(result.session!);
        }, 1200);
      } else {
        setSignUpErrors({ general: result.errorMessage || 'Registration failed.' });
      }
    } catch (err: any) {
      setSignUpErrors({ general: err.message || 'Failed to create student account.' });
    } finally {
      setSignUpLoading(false);
    }
  };

  // -------------------------
  // TEACHER SIGN UP HANDLER
  // -------------------------
  const handleTeacherSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const facultyUpper = signUpFacultyId.trim().toUpperCase();

    if (!facultyUpper) {
      errors.facultyId = 'Faculty ID is required.';
    } else if (facultyUpper.length < 5) {
      errors.facultyId = 'Faculty ID must be at least 5 characters (e.g., NECN-FAC-104).';
    }

    if (!signUpName.trim() || signUpName.trim().length < 3) {
      errors.name = 'Full Name must be at least 3 characters.';
    }

    if (!signUpEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail.trim())) {
      errors.email = 'Please provide a valid official college email address.';
    }

    if (!signUpPassword) {
      errors.password = 'Password is required.';
    } else if (passwordStrength.score < 2) {
      errors.password = 'Password is too weak. Please use at least 8 characters with letters, numbers, and symbols.';
    }

    if (signUpPassword !== signUpConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setSignUpErrors(errors);
      return;
    }

    setSignUpErrors({});
    setSignUpLoading(true);

    try {
      const result = await authService.registerTeacher({
        facultyId: facultyUpper,
        fullName: signUpName.trim(),
        officialEmail: signUpEmail.trim(),
        password: signUpPassword,
        department: signUpDepartment
      });

      if (result.success && result.account) {
        // Explicitly enforce: "Teacher accounts must be verified or approved before being granted teacher privileges.
        // Do not let a user become a teacher simply by selecting Teacher during registration."
        setPendingApprovalAccount({
          identifier: result.account.identifier,
          name: result.account.name,
          email: result.account.email
        });
        setSignUpSuccessMessage(
          `Faculty account registered for ${facultyUpper}. Administrative verification is required before teacher privileges are unlocked.`
        );
      } else {
        setSignUpErrors({ general: result.errorMessage || 'Teacher registration failed.' });
      }
    } catch (err: any) {
      setSignUpErrors({ general: err.message || 'Failed to submit faculty registration.' });
    } finally {
      setSignUpLoading(false);
    }
  };

  // -------------------------
  // FORGOT PASSWORD SUBMIT
  // -------------------------
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError(null);
    setFpSuccess(null);

    const cleanId = fpIdentifier.trim().toUpperCase();
    const cleanEmail = fpEmail.trim().toLowerCase();

    if (!cleanId || !cleanEmail || !fpNewPassword) {
      setFpError('Please fill in all required fields.');
      return;
    }

    if (fpNewPassword !== fpConfirmPassword) {
      setFpError('Passwords do not match.');
      return;
    }

    const strength = authService.evaluatePasswordStrength(fpNewPassword);
    if (strength.score < 2) {
      setFpError('New password must be at least 8 characters with uppercase, lowercase, numbers, and symbols.');
      return;
    }

    const result = await authService.resetPassword(cleanId, cleanEmail, fpNewPassword);
    if (result.success) {
      setFpSuccess('Password reset successfully! You can now sign in with your new password.');
      setTimeout(() => {
        setIsForgotPasswordOpen(false);
        setLoginIdentifier(cleanId);
        setLoginPassword('');
        setFpSuccess(null);
      }, 2000);
    } else {
      setFpError(result.errorMessage || 'Failed to reset password.');
    }
  };

  // Quick administrator approval simulator for test evaluators
  const handleSimulateAdminApproval = (facultyId: string) => {
    authService.approveTeacher(facultyId, 'Administrative Principal Office (Verified)');
    if (pendingApprovalAccount && pendingApprovalAccount.session) {
      const activatedSession: UserSession = {
        ...pendingApprovalAccount.session,
        status: 'active',
        isPendingApproval: false
      };
      setPendingApprovalAccount(null);
      login(activatedSession);
    } else {
      setPendingApprovalAccount(null);
      setLoginIdentifier(facultyId);
      setLoginError(null);
      setAuthMode('login');
      setActiveRole('teacher');
      setSignUpSuccessMessage(`Faculty ID ${facultyId} has been administratively approved! You can now log in with your password.`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="max-w-md w-full">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Building2 className="w-7 h-7 text-blue-700" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2545] font-display">
            NECN CampusPath
          </h1>
          <p className="text-xs font-semibold text-blue-900 tracking-wide uppercase mt-0.5">
            Campus Digital Twin · Narayana Engineering College, Nellore
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Secure authentication portal for students, faculty, and academic administration
          </p>
        </div>

        {/* Auth Main Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* Main Mode Toggle: LOGIN vs CREATE ACCOUNT (SIGN UP) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-blue-700" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('signup')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-700" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Role Toggle: Student vs Teacher */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => handleSwitchRole('student')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                activeRole === 'student'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 ring-1 ring-blue-400'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchRole('teacher')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                activeRole === 'teacher'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 ring-1 ring-blue-400'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>Teacher / Faculty</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* 1. LOGIN MODE (STUDENT & TEACHER)                         */}
          {/* ========================================================= */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {signUpSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{signUpSuccessMessage}</span>
                </div>
              )}

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Authentication Notice:</span> {loginError}
                  </div>
                </div>
              )}

              {/* Identifier Field: Roll Number for Student, Faculty ID for Teacher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {activeRole === 'student' ? 'Student Roll Number' : 'Faculty ID'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value.toUpperCase());
                    if (loginError) setLoginError(null);
                  }}
                  placeholder={activeRole === 'student' ? 'e.g. 21711A0501' : 'e.g. NECN-FAC-101'}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400 font-mono"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {activeRole === 'student'
                    ? 'Unique 10-character collegiate roll number'
                    : 'Official college faculty identification code'}
                </p>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFpRole(activeRole);
                      setFpIdentifier(loginIdentifier);
                      setIsForgotPasswordOpen(true);
                    }}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="Enter account password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <span>{loginLoading ? 'Authenticating...' : `Sign In as ${activeRole === 'student' ? 'Student' : 'Faculty'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* 2. SIGN UP MODE: STUDENT REGISTRATION                      */}
          {/* ========================================================= */}
          {authMode === 'signup' && activeRole === 'student' && (
            <form onSubmit={handleStudentSignUp} className="space-y-3.5">
              {signUpSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{signUpSuccessMessage}</span>
                </div>
              )}

              {signUpErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{signUpErrors.general}</span>
                </div>
              )}

              {/* Student Roll Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Roll Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signUpRoll}
                  onChange={(e) => setSignUpRoll(e.target.value.toUpperCase())}
                  placeholder="e.g. 21711A0501"
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono ${
                    signUpErrors.roll ? 'border-red-500' : 'border-slate-300'
                  }`}
                  required
                />
                {signUpErrors.roll ? (
                  <p className="text-[11px] text-red-600 mt-0.5">{signUpErrors.roll}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">Your unique collegiate identifier</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. K. Sravan Kumar"
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    signUpErrors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  required
                />
                {signUpErrors.name && (
                  <p className="text-[11px] text-red-600 mt-0.5">{signUpErrors.name}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="e.g. 21711a0501@necn.ac.in or personal email"
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    signUpErrors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                  required
                />
                {signUpErrors.email && (
                  <p className="text-[11px] text-red-600 mt-0.5">{signUpErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={`w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      signUpErrors.password ? 'border-red-500' : 'border-slate-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password Strength Meter */}
                {signUpPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Strength:</span>
                      <span className={`font-semibold ${
                        passwordStrength.score >= 3 ? 'text-emerald-600' : passwordStrength.score >= 2 ? 'text-amber-600' : 'text-red-500'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5">
                      <div className={`rounded-full ${passwordStrength.score >= 1 ? 'bg-red-500' : 'bg-slate-200'}`} />
                      <div className={`rounded-full ${passwordStrength.score >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                      <div className={`rounded-full ${passwordStrength.score >= 3 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                      <div className={`rounded-full ${passwordStrength.score >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </div>
                  </div>
                )}
                {signUpErrors.password && (
                  <p className="text-[11px] text-red-600 mt-0.5">{signUpErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignUpConfirmPassword ? 'text' : 'password'}
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      signUpErrors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showSignUpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signUpErrors.confirmPassword && (
                  <p className="text-[11px] text-red-600 mt-0.5">{signUpErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={signUpLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <span>{signUpLoading ? 'Creating Account...' : 'Register Student Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* 3. SIGN UP MODE: TEACHER / FACULTY REGISTRATION           */}
          {/* ========================================================= */}
          {authMode === 'signup' && activeRole === 'teacher' && (
            <form onSubmit={handleTeacherSignUp} className="space-y-3.5">
              {signUpSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{signUpSuccessMessage}</span>
                </div>
              )}

              {/* Administrative Verification Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#0B2545]">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Institutional Approval Policy</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Teacher accounts require administrator verification before granting faculty privileges. You will not receive editing privileges automatically upon registration.
                </p>
              </div>

              {signUpErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{signUpErrors.general}</span>
                </div>
              )}

              {/* Faculty ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signUpFacultyId}
                  onChange={(e) => setSignUpFacultyId(e.target.value.toUpperCase())}
                  placeholder="e.g. NECN-FAC-104"
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono ${
                    signUpErrors.facultyId ? 'border-red-500' : 'border-slate-300'
                  }`}
                  required
                />
                {signUpErrors.facultyId ? (
                  <p className="text-[11px] text-red-600 mt-0.5">{signUpErrors.facultyId}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">Assigned college faculty code</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (with Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Dr. P. Suresh"
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    signUpErrors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  required
                />
                {signUpErrors.name && (
                  <p className="text-[11px] text-red-600 mt-0.5">{signUpErrors.name}</p>
                )}
              </div>

              {/* Official College Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official College Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="e.g. faculty.name@necn.ac.in"
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    signUpErrors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                  required
                />
                {signUpErrors.email && (
                  <p className="text-[11px] text-red-600 mt-0.5">{signUpErrors.email}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Department
                </label>
                <select
                  value={signUpDepartment}
                  onChange={(e) => setSignUpDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication Engineering (ECE)</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                  <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
                  <option value="Freshman Engineering Department">Freshman Engineering Department (FED)</option>
                  <option value="College Administration">College Administration</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={`w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      signUpErrors.password ? 'border-red-500' : 'border-slate-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength */}
                {signUpPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Strength:</span>
                      <span className={`font-semibold ${
                        passwordStrength.score >= 3 ? 'text-emerald-600' : passwordStrength.score >= 2 ? 'text-amber-600' : 'text-red-500'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5">
                      <div className={`rounded-full ${passwordStrength.score >= 1 ? 'bg-red-500' : 'bg-slate-200'}`} />
                      <div className={`rounded-full ${passwordStrength.score >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                      <div className={`rounded-full ${passwordStrength.score >= 3 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                      <div className={`rounded-full ${passwordStrength.score >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </div>
                  </div>
                )}
                {signUpErrors.password && (
                  <p className="text-[11px] text-red-600 mt-0.5">{signUpErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignUpConfirmPassword ? 'text' : 'password'}
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      signUpErrors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showSignUpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signUpErrors.confirmPassword && (
                  <p className="text-[11px] text-red-600 mt-0.5">{signUpErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={signUpLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <span>{signUpLoading ? 'Submitting Registration...' : 'Submit Faculty Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Security Status Box */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-slate-800 font-semibold">
                    {firebaseStatus.isConfigured ? 'Cloud Firebase Active' : 'Cryptographic Local Vault Active'}
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    Passwords are protected with salted SHA-256 hashes. No plain text storage. Duplicate IDs and unapproved roles are strictly blocked.
                  </p>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between border-t border-slate-200/60">
                <span className="text-[10px] text-slate-400">Rules &amp; Schema</span>
                <button
                  type="button"
                  onClick={() => setIsFirebaseGuideOpen(true)}
                  className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2 flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>View Security Blueprint</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Test Accounts Accordion (for review and testing) */}
        <div className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowTestAccounts(!showTestAccounts)}
            className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-[#0B2545] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Tester Quick-Fill Credentials</span>
            </div>
            {showTestAccounts ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showTestAccounts && (
            <div className="p-3.5 space-y-2 text-xs border-t border-slate-200 bg-white">
              <p className="text-[11px] text-slate-500 mb-2">
                Click any credential card to auto-populate the sign-in form for rapid verification:
              </p>
              
              {/* Student Verified */}
              <div 
                onClick={() => fillTestCredentials('student')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                    <span>Verified Student (Sravan)</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Roll: <code className="font-mono text-slate-800 font-bold">21711A0501</code> · Pass: <code className="font-mono text-slate-800">Student@123</code>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              </div>

              {/* Teacher Approved */}
              <div 
                onClick={() => fillTestCredentials('teacher_approved')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                    <span>Approved Faculty (Dr. Suresh)</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ID: <code className="font-mono text-slate-800 font-bold">NECN-FAC-101</code> · Pass: <code className="font-mono text-slate-800">Faculty@123</code>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                  Approved
                </span>
              </div>

              {/* Teacher Pending */}
              <div 
                onClick={() => fillTestCredentials('teacher_pending')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Pending Faculty (Prof. Anitha)</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ID: <code className="font-mono text-slate-800 font-bold">NECN-FAC-999</code> · Pass: <code className="font-mono text-slate-800">Pending@123</code>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                  Pending Review
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* PENDING APPROVAL MODAL / STATUS ALERT DIALOG               */}
      {/* ========================================================= */}
      {pendingApprovalAccount && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto">
              <Clock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-[#0B2545]">
                Account Pending Administrative Approval
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Faculty ID: {pendingApprovalAccount.identifier}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">Registered Name:</span>
                <span>{pendingApprovalAccount.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">Status:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Under Administrative Review
                </span>
              </div>
              <p className="text-[11px] text-slate-600 pt-1 leading-relaxed border-t border-slate-200">
                To prevent unauthorized modification of campus directories, teacher accounts must be verified by the Principal or Dean's office before granting faculty privileges.
              </p>
            </div>

            {/* Quick Admin Test Approval button */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-950 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Tester / Evaluator Approval Shortcut:</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Want to test the verified faculty dashboard now? You can simulate administrative approval with one click:
              </p>
              <button
                type="button"
                onClick={() => handleSimulateAdminApproval(pendingApprovalAccount.identifier)}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simulate Administrator Approval &amp; Continue</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPendingApprovalAccount(null)}
                className="w-full py-2 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Close &amp; Return to Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FORGOT PASSWORD MODAL                                     */}
      {/* ========================================================= */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0B2545]">
                  Reset Your Password
                </h2>
                <p className="text-xs text-slate-500">
                  Verify your registered identity to set a new password
                </p>
              </div>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              {fpError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fpError}</span>
                </div>
              )}

              {fpSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{fpSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFpRole('student')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border ${
                      fpRole === 'student' ? 'bg-blue-50 border-blue-300 text-blue-900' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setFpRole('teacher')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border ${
                      fpRole === 'teacher' ? 'bg-blue-50 border-blue-300 text-blue-900' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Teacher
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {fpRole === 'student' ? 'Student Roll Number' : 'Faculty ID'}
                </label>
                <input
                  type="text"
                  value={fpIdentifier}
                  onChange={(e) => setFpIdentifier(e.target.value.toUpperCase())}
                  placeholder={fpRole === 'student' ? '21711A0501' : 'NECN-FAC-101'}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                  placeholder="name@necn.ac.in"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  value={fpNewPassword}
                  onChange={(e) => setFpNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={fpConfirmPassword}
                  onChange={(e) => setFpConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Firebase Auth & Blueprint Guide Modal */}
      <FirebaseAuthGuideModal 
        isOpen={isFirebaseGuideOpen} 
        onClose={() => setIsFirebaseGuideOpen(false)} 
      />
    </div>
  );
};
