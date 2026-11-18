import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Camera,
  Fingerprint,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  User,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  Eye,
  Sliders,
  Cpu,
  ArrowRight,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSecureGuardStatus } from '../hooks/useSecureGuardStatus';
import { SecurityService, DualVerifyResponse } from '../services/securityService';
import { NidService } from '../services/nidService';
import { DemoNidRecord } from '../types/nidRecord';
import { getEndpoints } from '../services/config';

type PipelineState =
  | 'WAITING_FOR_NID'
  | 'CHECKING_NID'
  | 'DETECTING_FACE'
  | 'FACE_MATCHED'
  | 'WAITING_FOR_FINGERPRINT'
  | 'VERIFYING_FINGERPRINT'
  | 'BOTH_BIOMETRICS_MATCHED'
  | 'ACCESS_GRANTED'
  | 'ACCESS_DENIED'
  | 'DEVICE_OFFLINE'
  | 'VERIFICATION_FAILED';

export const BiometricVerification: React.FC = () => {
  const { addToast } = useApp();
  const { status: liveStatus, isLiveConnected } = useSecureGuardStatus();
  const endpoints = getEndpoints();

  const [nidInput, setNidInput] = useState<string>('7845129630');
  const [fingerprintSlot, setFingerprintSlot] = useState<number>(1);
  const [isEvaluationMode, setIsEvaluationMode] = useState<boolean>(false);
  const [pipelineState, setPipelineState] = useState<PipelineState>('WAITING_FOR_NID');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<DualVerifyResponse | null>(null);
  const [enrolledRecords, setEnrolledRecords] = useState<DemoNidRecord[]>([]);

  // Fetch enrolled citizens for easy viva testing selection
  useEffect(() => {
    async function loadRegistered() {
      const res = await NidService.getRecords();
      if (res.success && res.data) {
        setEnrolledRecords(res.data);
      }
    }
    loadRegistered();
  }, []);

  const handleSelectPreFill = (rec: DemoNidRecord) => {
    setNidInput(rec.nid || rec.demo_nid_number || '');
    if (rec.fingerprint_id) setFingerprintSlot(rec.fingerprint_id);
    setVerificationResult(null);
    setPipelineState('WAITING_FOR_NID');
  };

  const executeVerification = async (simMode: boolean = false, mismatchFp?: number, simFaceFail: boolean = false) => {
    if (!nidInput.trim()) {
      addToast({ title: 'NID Required', message: 'Please enter a valid NID number first.', type: 'warning' });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    // Step 1: Checking NID
    setPipelineState('CHECKING_NID');
    await new Promise((r) => setTimeout(r, 400));

    // Step 2 & 3: Detecting Face
    setPipelineState('DETECTING_FACE');
    await new Promise((r) => setTimeout(r, 600));

    const fpIdToUse = mismatchFp !== undefined ? mismatchFp : fingerprintSlot;

    try {
      const res = await SecurityService.verifyDualBiometrics({
        nid: nidInput.trim(),
        fingerprint_id: fpIdToUse,
        simulated_mode: simMode,
        sim_face_match: !simFaceFail,
      });

      const data = res.data;
      setVerificationResult(data || null);

      if (data?.access_result === 'GRANTED') {
        setPipelineState('FACE_MATCHED');
        await new Promise((r) => setTimeout(r, 300));
        setPipelineState('WAITING_FOR_FINGERPRINT');
        await new Promise((r) => setTimeout(r, 400));
        setPipelineState('VERIFYING_FINGERPRINT');
        await new Promise((r) => setTimeout(r, 300));
        setPipelineState('BOTH_BIOMETRICS_MATCHED');
        await new Promise((r) => setTimeout(r, 300));
        setPipelineState('ACCESS_GRANTED');

        addToast({
          title: 'ACCESS GRANTED',
          message: `Dual Biometrics Verified for NID ${nidInput}. Identity Confirmed.`,
          type: 'success',
        });
      } else {
        if (data?.reason === 'CAMERA_OFFLINE') {
          setPipelineState('DEVICE_OFFLINE');
        } else {
          setPipelineState('ACCESS_DENIED');
        }

        addToast({
          title: 'ACCESS DENIED',
          message: data?.message || `Access Denied: ${data?.reason || 'Biometric check failed'}`,
          type: 'error',
        });
      }
    } catch (err: any) {
      setPipelineState('VERIFICATION_FAILED');
      addToast({
        title: 'Gateway Failure',
        message: err.message || 'Verification pipeline encountered a network/server failure.',
        type: 'error',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStateDescription = (): { title: string; color: string; desc: string } => {
    switch (pipelineState) {
      case 'WAITING_FOR_NID':
        return { title: 'Awaiting NID Input', color: 'text-slate-400', desc: 'Enter citizen NID and initiate dual-biometric pipeline.' };
      case 'CHECKING_NID':
        return { title: 'Checking NID Registration', color: 'text-cyan-400', desc: 'Validating NID against national identity database...' };
      case 'DETECTING_FACE':
        return { title: 'Detecting Face', color: 'text-blue-400', desc: 'Capturing facial frame from camera & computing LBPH distance...' };
      case 'FACE_MATCHED':
        return { title: 'Face Matched', color: 'text-emerald-400', desc: 'Facial signature matches enrolled biometric profile.' };
      case 'WAITING_FOR_FINGERPRINT':
        return { title: 'Waiting for Fingerprint', color: 'text-amber-400', desc: 'Prompting subject to place finger on R307S optical sensor...' };
      case 'VERIFYING_FINGERPRINT':
        return { title: 'Verifying Fingerprint', color: 'text-cyan-400', desc: 'Checking template ID against hardware flash memory...' };
      case 'BOTH_BIOMETRICS_MATCHED':
        return { title: 'Both Biometrics Matched', color: 'text-emerald-400', desc: 'Facial ID and fingerprint template confirm identical citizen record.' };
      case 'ACCESS_GRANTED':
        return { title: 'ACCESS GRANTED', color: 'text-emerald-400', desc: 'Dual-biometric authentication succeeded. Perimeter clearance granted.' };
      case 'ACCESS_DENIED':
        return { title: 'ACCESS DENIED', color: 'text-rose-400', desc: verificationResult?.reason || 'Verification criteria failed. Access prohibited.' };
      case 'DEVICE_OFFLINE':
        return { title: 'Device Offline', color: 'text-amber-400', desc: 'ESP32-S3 Camera is offline. Live verification halted by zero-trust rule.' };
      case 'VERIFICATION_FAILED':
        return { title: 'Verification Failed', color: 'text-rose-500', desc: 'Backend or communication error occurred.' };
      default:
        return { title: 'Standby', color: 'text-slate-400', desc: 'Ready for access request.' };
    }
  };

  const stateInfo = getStateDescription();

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner & Mode Switcher */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <span>Dual-Biometric Verification Gateway</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict 8-Step Dual-Biometric Authentication: Face Recognition (LBPH) + Fingerprint Verification (R307S)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Hardware Connection Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${liveStatus?.camera_online ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`}></span>
            <span className="text-[11px] text-slate-300">
              Camera: <strong className={liveStatus?.camera_online ? 'text-emerald-400' : 'text-rose-400'}>{liveStatus?.camera_online ? 'ESP32 ONLINE' : 'OFFLINE'}</strong>
            </span>
          </div>

          {/* Evaluation Mode Toggle */}
          <button
            onClick={() => setIsEvaluationMode(!isEvaluationMode)}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              isEvaluationMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isEvaluationMode ? 'Lab Simulation Active' : 'Live Hardware Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Camera & HUD Reticle (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Live Camera Stream */}
            <img
              src={endpoints.video}
              alt="ESP32 Live Stream"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Futuristic Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400 bg-slate-950/80 px-2 py-1 rounded border border-cyan-500/20">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  ESP32-S3 OV2640 BIOMETRIC RETICLE
                </span>
                <span className="text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                  FPS: {liveStatus?.fps || (liveStatus?.camera_online ? 15 : 0)}
                </span>
              </div>

              {/* Central Target Reticle */}
              <div className="relative flex items-center justify-center">
                <div className={`w-44 h-44 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center ${
                  pipelineState === 'ACCESS_GRANTED'
                    ? 'border-emerald-400 shadow-lg shadow-emerald-500/30'
                    : pipelineState === 'ACCESS_DENIED'
                    ? 'border-rose-500 shadow-lg shadow-rose-500/30'
                    : isVerifying
                    ? 'border-cyan-400 animate-pulse'
                    : 'border-slate-700/60'
                }`}>
                  <div className="w-3 h-3 border-t-2 border-l-2 border-cyan-400 absolute top-2 left-2"></div>
                  <div className="w-3 h-3 border-t-2 border-r-2 border-cyan-400 absolute top-2 right-2"></div>
                  <div className="w-3 h-3 border-b-2 border-l-2 border-cyan-400 absolute bottom-2 left-2"></div>
                  <div className="w-3 h-3 border-b-2 border-r-2 border-cyan-400 absolute bottom-2 right-2"></div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 ${
                    pipelineState === 'ACCESS_GRANTED'
                      ? 'text-emerald-400 border border-emerald-500/40'
                      : pipelineState === 'ACCESS_DENIED'
                      ? 'text-rose-400 border border-rose-500/40'
                      : 'text-slate-400'
                  }`}>
                    {pipelineState === 'ACCESS_GRANTED' ? 'IDENTITY MATCH' : pipelineState === 'ACCESS_DENIED' ? 'ACCESS DENIED' : 'ALIGN FACE'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span className="bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                  FACIAL ENGINE: OpenCV LBPH
                </span>
                <span className="bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-cyan-400">
                  FINGERPRINT: R307S OPTICAL
                </span>
              </div>
            </div>
          </div>

          {/* Sequential 4-Stage Pipeline Tracker */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
              <span>Authentication Pipeline Sequence</span>
              <span className={stateInfo.color}>{stateInfo.title}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { stage: 1, label: 'NID Exists', active: pipelineState !== 'WAITING_FOR_NID', pass: verificationResult?.step_results?.nid_registered },
                { stage: 2, label: 'Face Match', active: ['DETECTING_FACE', 'FACE_MATCHED', 'WAITING_FOR_FINGERPRINT', 'VERIFYING_FINGERPRINT', 'BOTH_BIOMETRICS_MATCHED', 'ACCESS_GRANTED'].includes(pipelineState), pass: verificationResult?.step_results?.face_matched },
                { stage: 3, label: 'Fingerprint', active: ['WAITING_FOR_FINGERPRINT', 'VERIFYING_FINGERPRINT', 'BOTH_BIOMETRICS_MATCHED', 'ACCESS_GRANTED'].includes(pipelineState), pass: verificationResult?.step_results?.fingerprint_matched },
                { stage: 4, label: 'Same Record', active: ['BOTH_BIOMETRICS_MATCHED', 'ACCESS_GRANTED'].includes(pipelineState), pass: verificationResult?.step_results?.identity_matched },
              ].map((st) => (
                <div
                  key={st.stage}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    st.pass
                      ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400'
                      : st.active && isVerifying
                      ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-400 animate-pulse'
                      : verificationResult && !st.pass
                      ? 'border-rose-500/40 bg-rose-950/10 text-rose-400'
                      : 'border-slate-800 bg-slate-950 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] font-bold">Stage 0{st.stage}</div>
                  <div className="text-[11px] font-semibold truncate text-white">{st.label}</div>
                  <div className="text-[9px] mt-0.5">
                    {st.pass ? 'PASS' : verificationResult && !st.pass ? 'FAIL' : st.active ? 'CHECKING' : 'IDLE'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Input & Verification Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Input Controls Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verification Credentials</span>
              </span>
              <span className="text-[10px] text-slate-400">Step 1 & Step 5</span>
            </div>

            {/* Quick prefill picker for defense viva */}
            <div>
              <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Select Registered Citizen (Viva Quick-Fill):</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto pr-1">
                {enrolledRecords.map((r) => (
                  <button
                    key={r.nid || r.id}
                    onClick={() => handleSelectPreFill(r)}
                    className={`p-2 rounded-lg border text-left text-[10px] transition-all truncate ${
                      nidInput === (r.nid || r.demo_nid_number)
                        ? 'border-cyan-500 bg-cyan-950/30 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate font-semibold">{r.name}</div>
                    <div className="text-[9px] text-slate-400 font-mono">FP #{r.fingerprint_id || '?'} • {(r.nid || r.demo_nid_number || '').substring(0, 5)}...</div>
                  </button>
                ))}
              </div>
            </div>

            {/* NID Input Field */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Citizen NID Number *</label>
              <input
                type="text"
                value={nidInput}
                onChange={(e) => setNidInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10, 13, or 17 digit NID"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Fingerprint ID Input / Hardware Slot */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">R307S Fingerprint Template Slot</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="127"
                  value={fingerprintSlot}
                  onChange={(e) => setFingerprintSlot(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                />
                <div className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-[10px] flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Optical Glass Sensor Slot (1-127)</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => executeVerification(isEvaluationMode)}
              disabled={isVerifying}
              className={`w-full py-3.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 shadow-lg ${
                isVerifying
                  ? 'bg-slate-800 text-slate-400 cursor-wait'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 shadow-cyan-900/30'
              }`}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Biometric Pipeline...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Execute Dual-Biometric Verification</span>
                </>
              )}
            </button>

            {/* Test Scenarios for Examination Viva */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <Info className="w-3 h-3 text-amber-400" />
                <span>Security Test Cases (Zero-Trust Proof):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => executeVerification(true, (fingerprintSlot % 5) + 1)}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-slate-300 text-[10px] text-left transition-colors"
                >
                  <div className="font-bold text-rose-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span>Identity Mismatch</span>
                  </div>
                  <div className="text-[9px] text-slate-500">Wrong Fingerprint Slot</div>
                </button>

                <button
                  onClick={() => executeVerification(true, fingerprintSlot, true)}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-slate-300 text-[10px] text-left transition-colors"
                >
                  <div className="font-bold text-rose-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span>Face Match Fail</span>
                  </div>
                  <div className="text-[9px] text-slate-500">Unrecognized Face</div>
                </button>
              </div>
            </div>
          </div>

          {/* FINAL DECISION RESULT DISPLAY */}
          {verificationResult && (
            <div className={`p-5 rounded-2xl border transition-all ${
              verificationResult.access_result === 'GRANTED'
                ? 'border-emerald-500/60 bg-gradient-to-b from-emerald-950/40 to-slate-950 shadow-2xl shadow-emerald-950/50'
                : 'border-rose-500/60 bg-gradient-to-b from-rose-950/40 to-slate-950 shadow-2xl shadow-rose-950/50'
            }`}>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                {verificationResult.access_result === 'GRANTED' ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <Unlock className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className={`text-base font-bold font-display tracking-wide ${
                    verificationResult.access_result === 'GRANTED' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {verificationResult.access_result === 'GRANTED' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Reason: <strong className="text-white">{verificationResult.reason}</strong>
                  </p>
                </div>
              </div>

              {/* Citizen Identity Revealed ONLY WHEN ACCESS GRANTED */}
              {verificationResult.access_result === 'GRANTED' && verificationResult.citizen_details && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2 text-[11px]">
                  <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Decrypted Citizen Identity Card</span>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Citizen Name:</span>
                      <span className="font-bold text-white">{verificationResult.citizen_details.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">NID Number:</span>
                      <span className="font-mono text-cyan-300 font-bold">{verificationResult.citizen_details.nid}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Date of Birth:</span>
                      <span>{verificationResult.citizen_details.date_of_birth}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Blood Group:</span>
                      <span>{verificationResult.citizen_details.blood_group}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Residential Address:</span>
                      <span className="text-right truncate max-w-[180px]">{verificationResult.citizen_details.address}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Denial Explanation Card */}
              {verificationResult.access_result === 'DENIED' && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Zero-Trust Policy Enforcement</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Access was denied because dual-biometric criteria was not satisfied. Single biometric match alone is strictly prohibited by security protocol.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
