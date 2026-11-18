import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { 
  KeyRound, 
  User, 
  ScanFace, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ArrowDown, 
  Sparkles,
  Lock
} from 'lucide-react';
import { DemoNidRecord } from '../../types/nid';
import { AccessResult } from '../../types/security';
import { SecurityService } from '../../services/securityService';
import { useApp } from '../../context/AppContext';

interface AccessSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: DemoNidRecord[];
  onComplete: () => void;
}

export const AccessSimulatorModal: React.FC<AccessSimulatorModalProps> = ({
  isOpen,
  onClose,
  records,
  onComplete,
}) => {
  const { addToast } = useApp();

  const [selectedUser, setSelectedUser] = useState<string>('admin');
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    records[0]?.record_id || 'NID-DEMO-001'
  );
  const [authMethod, setAuthMethod] = useState<
    'Face Authentication' | 'PIN + Face' | 'Biometric Card' | 'Admin Override'
  >('Face Authentication');
  const [forceOutcome, setForceOutcome] = useState<'auto' | 'force_allow' | 'force_deny'>('auto');

  // Multi-step simulator state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<AccessResult | null>(null);
  const [decisionReason, setDecisionReason] = useState<string>('');

  const runSimulation = async () => {
    setIsSimulating(true);
    setCurrentStep(1); // User Identification

    await new Promise((r) => setTimeout(r, 450));
    setCurrentStep(2); // Authentication (Face verification)

    await new Promise((r) => setTimeout(r, 550));
    setCurrentStep(3); // Authorization (RBAC evaluation)

    await new Promise((r) => setTimeout(r, 450));
    setCurrentStep(4); // Access Decision

    const targetRecord = records.find((r) => r.record_id === selectedRecordId);
    let isDenied = false;
    let reason = '';

    if (forceOutcome === 'force_deny') {
      isDenied = true;
      reason = 'Biometric feature vector deviation exceeded 0.40 threshold. Authentication rejected.';
    } else if (forceOutcome === 'force_allow') {
      isDenied = false;
      reason = 'Biometric edge verification passed and role permission validated.';
    } else {
      // Auto logic
      if (targetRecord?.account_status === 'Disabled') {
        isDenied = true;
        reason = `Demo Record ${selectedRecordId} is marked as Disabled in central identity registry.`;
      } else if (targetRecord?.biometric_status === 'Not Registered') {
        isDenied = true;
        reason = `No biometric template registered for target demo record ${selectedRecordId}.`;
      } else if (selectedUser === 'unknown') {
        isDenied = true;
        reason = 'Unknown subject presented at terminal; no matching profile.';
      } else {
        isDenied = false;
        reason = 'Edge face detected, feature vector matched synthetic template, RBAC token valid.';
      }
    }

    const decision: AccessResult = isDenied ? 'DENIED' : 'ALLOWED';
    setResult(decision);
    setDecisionReason(reason);

    // Call service to log
    await SecurityService.simulateAccessRequest({
      user: selectedUser,
      targetRecordId: selectedRecordId,
      method: authMethod,
      forceDenial: isDenied,
      denialReason: reason,
    });

    setIsSimulating(false);
    onComplete();

    addToast({
      title: `Access Request: ${decision}`,
      message: `${authMethod} evaluated for ${selectedRecordId}. Result: ${decision}`,
      type: decision === 'ALLOWED' ? 'success' : 'error',
    });
  };

  const handleReset = () => {
    setCurrentStep(0);
    setResult(null);
    setDecisionReason('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Biometric Access Control Simulator"
      subtitle="Evaluates User Identity → Edge Authentication → Authorization → Access Decision"
      maxWidth="xl"
    >
      <div className="space-y-5 font-mono text-xs">
        {/* Configuration Step */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-300 text-[11px]">
              This wizard tests the complete zero-trust access pipeline between the ESP32 camera node and the backend.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] uppercase mb-1">
                  Subject / Presenting User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
                >
                  <option value="admin">Administrator (admin)</option>
                  <option value="security">Security Officer (security)</option>
                  <option value="operator">Operator (operator)</option>
                  <option value="unknown">Unknown Subject (Simulate Intrusion)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] uppercase mb-1">
                  Target Demo NID Record
                </label>
                <select
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
                >
                  {records.map((r) => (
                    <option key={r.id} value={r.record_id}>
                      {r.record_id} — {r.name} ({r.account_status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] uppercase mb-1">
                  Access Verification Method
                </label>
                <select
                  value={authMethod}
                  onChange={(e) => setAuthMethod(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
                >
                  <option value="Face Authentication">Face Authentication (Edge Camera)</option>
                  <option value="PIN + Face">PIN + Face (Multi-Factor)</option>
                  <option value="Biometric Card">Biometric Card + Camera</option>
                  <option value="Admin Override">Admin Cryptographic Override</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] uppercase mb-1">
                  Simulation Outcome
                </label>
                <select
                  value={forceOutcome}
                  onChange={(e) => setForceOutcome(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
                >
                  <option value="auto">Automatic (Based on target status & role)</option>
                  <option value="force_allow">Force Scenario: ACCESS ALLOWED</option>
                  <option value="force_deny">Force Scenario: ACCESS DENIED</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={runSimulation}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Simulate Access Pipeline
              </button>
            </div>
          </div>
        )}

        {/* Pipeline Execution Flow Animation */}
        {currentStep > 0 && (
          <div className="space-y-4">
            {/* Step Pipeline Visualization */}
            <div className="space-y-2">
              {/* Step 1: User */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${
                  currentStep >= 1
                    ? 'bg-slate-950/80 border-blue-500/50 text-slate-200'
                    : 'bg-slate-950/30 border-slate-800 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs">1. Subject Identification</div>
                    <div className="text-[11px] text-slate-400">
                      Presenting User: <span className="text-white">{selectedUser}</span>
                    </div>
                  </div>
                </div>
                {currentStep >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>

              {/* Step 2: Authentication */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${
                  currentStep >= 2
                    ? 'bg-slate-950/80 border-cyan-500/50 text-slate-200'
                    : 'bg-slate-950/30 border-slate-800 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400">
                    <ScanFace className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs">2. Edge Biometric Authentication</div>
                    <div className="text-[11px] text-slate-400">
                      Method: <span className="text-white">{authMethod}</span>
                    </div>
                  </div>
                </div>
                {currentStep >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>

              {/* Step 3: Authorization */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${
                  currentStep >= 3
                    ? 'bg-slate-950/80 border-indigo-500/50 text-slate-200'
                    : 'bg-slate-950/30 border-slate-800 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs">3. Role-Based Authorization Policy</div>
                    <div className="text-[11px] text-slate-400">
                      Evaluating target demo resource permissions
                    </div>
                  </div>
                </div>
                {currentStep >= 4 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>

              {/* Step 4: Final Access Decision Banner */}
              {currentStep === 4 && result && (
                <div
                  className={`p-5 rounded-xl border text-center transition-all duration-300 ${
                    result === 'ALLOWED'
                      ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
                      : 'bg-rose-950/70 border-rose-500/80 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    {result === 'ALLOWED' ? (
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    ) : (
                      <XCircle className="w-10 h-10 text-rose-400" />
                    )}
                  </div>
                  <div className="text-xl font-bold font-mono tracking-wider">
                    {result === 'ALLOWED' ? 'ACCESS ALLOWED' : 'ACCESS DENIED'}
                  </div>
                  <p className="text-xs mt-2 max-w-md mx-auto leading-relaxed text-slate-300">
                    {decisionReason}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                    Audit log written to security database • Event ID: SEC-{Date.now().toString().slice(-6)}
                  </div>
                </div>
              )}
            </div>

            {/* Step Controls */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={handleReset}
                disabled={isSimulating}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              >
                Run Another Simulation
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
