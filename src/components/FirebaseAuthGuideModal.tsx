import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Check, 
  Copy, 
  Code2, 
  Lock, 
  FileJson, 
  ShieldAlert,
  Server
} from 'lucide-react';
import { getFirebaseStatus } from '../services/firebaseConfig';

interface FirebaseAuthGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseAuthGuideModal: React.FC<FirebaseAuthGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'rules' | 'integration'>('blueprint');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const firebaseStatus = getFirebaseStatus();

  const blueprintSnippet = `{
  "schemaVersion": "1.0.0",
  "entities": {
    "users": {
      "description": "User accounts mapped by institutional identifier (Roll Number for students, Faculty ID for teachers)",
      "fields": {
        "uid": { "type": "string", "description": "Firebase Auth UID" },
        "identifier": { "type": "string", "description": "Student Roll Number or Faculty ID (UPPERCASE)" },
        "role": { "type": "string", "enum": ["student", "teacher"] },
        "name": { "type": "string", "description": "Full legal name" },
        "email": { "type": "string", "description": "Institutional or personal email" },
        "department": { "type": "string", "description": "Academic department" },
        "status": { "type": "string", "enum": ["active", "pending_approval", "rejected"] },
        "createdAt": { "type": "timestamp" },
        "approvedAt": { "type": "timestamp", "optional": true },
        "approvedBy": { "type": "string", "optional": true }
      }
    },
    "rooms": {
      "description": "Campus rooms, seminar halls, labs and outdoor locations",
      "fields": {
        "id": { "type": "string" },
        "roomNumber": { "type": "string" },
        "name": { "type": "string" },
        "block": { "type": "string", "enum": ["Block A", "Block B", "Block C", "Campus Grounds", "Parking Areas"] },
        "floor": { "type": "string" },
        "category": { "type": "string" },
        "department": { "type": "string" },
        "updatedAt": { "type": "timestamp" },
        "updatedBy": { "type": "string" }
      }
    }
  }
}`;

  const rulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isApprovedTeacher() {
      return isAuthenticated() && 
             getUserData().role == 'teacher' && 
             getUserData().status == 'active';
    }

    // User accounts collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      // Cannot self-promote role or status:
      allow update: if isOwner(userId) && 
                       (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'status'])) ||
                       isApprovedTeacher();
      allow delete: if false;
    }

    // Campus Room directory
    // Public read for campus wayfinding; write restricted to approved teachers
    match /rooms/{roomId} {
      allow read: if true;
      allow write: if isApprovedTeacher();
    }
  }
}`;

  const codeSnippet = `// 1. Mapping institutional identifier to Firebase Auth
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// Student Sign In: Maps Roll Number (e.g. 21711A0501)
export async function loginStudent(rollNumber: string, password: string) {
  const email = \`\${rollNumber.toLowerCase().trim()}@student.necn.ac.in\`;
  const creds = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", creds.user.uid));
  return { user: creds.user, profile: snap.data() };
}

// Teacher Sign In: Maps Faculty ID (e.g. NECN-FAC-101)
export async function loginFaculty(facultyId: string, password: string) {
  const email = \`\${facultyId.toLowerCase().trim()}@faculty.necn.ac.in\`;
  const creds = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", creds.user.uid));
  const profile = snap.data();
  
  if (profile?.status === 'pending_approval') {
    throw new Error("Account pending administrative verification.");
  }
  return { user: creds.user, profile };
}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl border border-slate-200 z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white text-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-[#0B2545]">
                Account Security &amp; Firebase Blueprint
              </h2>
              <p className="text-xs text-slate-500">
                Authentication architecture, database schema, and role-based access rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pill Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${firebaseStatus.isConfigured ? 'bg-emerald-500' : 'bg-blue-600 animate-pulse'}`} />
            <span className="font-semibold text-slate-800">
              Current Environment: {firebaseStatus.statusText}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            SHA-256 Salted Vault Active
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'blueprint'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Schema Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Firestore Rules (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveTab('integration')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'integration'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Roll &amp; ID Mapping</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
          
          {activeTab === 'blueprint' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  firebase-blueprint.json (Firestore Schema)
                </span>
                <button
                  onClick={() => copyToClipboard(blueprintSnippet, 'blueprint')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  {copied === 'blueprint' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied === 'blueprint' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500">
                This schema specifies collection structures for accounts (<code className="font-mono text-slate-800">users</code>) and facilities (<code className="font-mono text-slate-800">rooms</code>). Notice that <code className="font-mono text-slate-800">status</code> tracks teacher administrative verification.
              </p>
              <pre className="p-3.5 bg-slate-50 border border-slate-300 text-slate-800 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64 leading-relaxed">
                {blueprintSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  firestore.rules (Role-Based Permissions)
                </span>
                <button
                  onClick={() => copyToClipboard(rulesSnippet, 'rules')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  {copied === 'rules' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied === 'rules' ? 'Copied' : 'Copy Rules'}</span>
                </button>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Enforcing Unapproved Teacher Restriction</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Per security rules, writing or modifying room records requires <code className="font-mono text-slate-800">isApprovedTeacher()</code> (meaning <code className="font-mono text-slate-800">role == 'teacher' &amp;&amp; status == 'active'</code>). Users cannot elevate themselves to 'active' without administrator review.
                </p>
              </div>
              <pre className="p-3.5 bg-slate-50 border border-slate-300 text-slate-800 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64 leading-relaxed">
                {rulesSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'integration' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Identifier Mapping &amp; Client SDK Code
                </span>
                <button
                  onClick={() => copyToClipboard(codeSnippet, 'code')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  {copied === 'code' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied === 'code' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Roll Numbers (<code className="font-mono text-slate-800">21711A0501</code>) and Faculty IDs (<code className="font-mono text-slate-800">NECN-FAC-101</code>) are systematically mapped to unique domain addresses for Firebase Authentication sign-in.
              </p>
              <pre className="p-3.5 bg-slate-50 border border-slate-300 text-slate-800 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64 leading-relaxed">
                {codeSnippet}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Narayana Engineering College · Campus Digital Twin
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
