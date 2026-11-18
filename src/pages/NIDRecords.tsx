import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  UserPlus,
  Camera,
  Fingerprint,
  Calendar,
  MapPin,
  Phone,
  Droplet
} from 'lucide-react';
import { DemoNidRecord, BiometricStatus, AccountStatus } from '../types/nidRecord';
import { NidService } from '../services/nidService';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const NIDRecords: React.FC = () => {
  const { hasPermission, user } = useAuth();
  const { addToast, setActivePage } = useApp();

  const [records, setRecords] = useState<DemoNidRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [biometricFilter, setBiometricFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Masking toggle state
  const [revealedNids, setRevealedNids] = useState<Set<string>>(new Set());

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState<DemoNidRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<DemoNidRecord | null>(null);

  const canManage = hasPermission('canManageNidRecords');

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await NidService.getRecords({
        search,
        biometricStatus: biometricFilter as any,
        accountStatus: statusFilter as any,
      });
      if (res.success && res.data) {
        setRecords(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [search, biometricFilter, statusFilter]);

  const toggleMask = (nid: string) => {
    setRevealedNids((prev) => {
      const next = new Set(prev);
      if (next.has(nid)) next.delete(nid);
      else next.add(nid);
      return next;
    });
  };

  const maskNid = (nid: string): string => {
    if (!nid) return '•••• •••• ••••';
    if (revealedNids.has(nid)) return nid;
    if (nid.length <= 4) return '•••• ' + nid;
    return '•••• •••• ' + nid.slice(-4);
  };

  // Open Edit Modal
  const handleOpenEdit = (rec: DemoNidRecord) => {
    if (!canManage) {
      addToast({
        title: 'Action Restricted by RBAC',
        message: 'Only Administrators and Security Officers can edit NID records.',
        type: 'warning',
      });
      return;
    }
    setEditFormData({
      name: rec.name,
      address: rec.address,
      contact_number: rec.contact_number || '',
      account_status: rec.account_status,
      gender: rec.gender || 'Other',
      blood_group: rec.blood_group || 'O+',
    });
    setSelectedRecord(rec);
    setIsEditOpen(true);
  };

  // Submit Edit
  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
    const targetNid = selectedRecord.nid || selectedRecord.demo_nid_number || String(selectedRecord.id);
    try {
      const res = await NidService.updateRecord(targetNid, editFormData);
      if (res.success) {
        addToast({
          title: 'Record Updated',
          message: `NID ${targetNid} demographics successfully updated.`,
          type: 'success',
        });
        setIsEditOpen(false);
        loadRecords();
      }
    } catch (err: any) {
      addToast({ title: 'Update Failed', message: err.message, type: 'error' });
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmRecord) return;
    const targetNid = deleteConfirmRecord.nid || deleteConfirmRecord.demo_nid_number || String(deleteConfirmRecord.id);
    try {
      const res = await NidService.deleteRecord(targetNid);
      if (res.success) {
        addToast({
          title: 'Record Deleted',
          message: `NID ${targetNid} and biometric profiles removed.`,
          type: 'info',
        });
        setDeleteConfirmRecord(null);
        loadRecords();
      }
    } catch (err: any) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-400" />
            <span>National Identity Records Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Encrypted demographic database bound to OpenCV LBPH facial profiles and R307S fingerprint IDs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('registration')}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll New Citizen</span>
          </button>

          <button
            onClick={loadRecords}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search citizen by Name, NID, or Residential Address..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={biometricFilter}
            onChange={(e) => setBiometricFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="All">All Biometric Statuses</option>
            <option value="Registered">Registered (Dual Biometrics)</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Not Registered">Not Registered</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="All">All Account Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[9px] font-bold border-b border-slate-800 tracking-wider">
              <tr>
                <th className="py-3 px-4">National ID (Masked)</th>
                <th className="py-3 px-4">Citizen Name</th>
                <th className="py-3 px-4">Face Enrollment</th>
                <th className="py-3 px-4">Fingerprint Slot</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No citizen records matched the search query or filter criteria.
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const recNid = rec.nid || rec.demo_nid_number || String(rec.id);
                  return (
                    <tr key={recNid} className="hover:bg-slate-900/40 transition-colors">
                      {/* NID with Mask/Reveal toggle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-300 font-mono tracking-wider">
                            {maskNid(recNid)}
                          </span>
                          <button
                            onClick={() => toggleMask(recNid)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title={revealedNids.has(recNid) ? 'Mask NID' : 'Reveal NID (Authorized)'}
                          >
                            {revealedNids.has(recNid) ? (
                              <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                    {/* Full Name */}
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      {rec.name}
                    </td>

                    {/* Face Enrollment Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Camera className={`w-3.5 h-3.5 ${rec.face_registered ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          rec.face_registered
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rec.face_registered ? 'LBPH ENROLLED' : 'NOT ENROLLED'}
                        </span>
                      </div>
                    </td>

                    {/* Fingerprint Template Slot */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Fingerprint className={`w-3.5 h-3.5 ${rec.fingerprint_id ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          rec.fingerprint_id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rec.fingerprint_id ? `SLOT #${rec.fingerprint_id}` : 'UNASSIGNED'}
                        </span>
                      </div>
                    </td>

                    {/* Registration Date */}
                    <td className="py-3 px-4 text-slate-400 text-[10px] whitespace-nowrap">
                      {rec.created_at ? rec.created_at.substring(0, 10) : '2026-11-18'}
                    </td>

                    {/* Account Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        rec.account_status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : rec.account_status === 'Suspended'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {rec.account_status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRecord(rec);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white transition-colors"
                          title="Edit Permitted Info"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-400" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmRecord(rec)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {isDetailOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-display">National ID Citizen Dossier</h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-[11px] text-slate-300">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-bold text-white">{selectedRecord.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">National ID Number:</span>
                <span className="font-mono text-cyan-300 font-bold">{selectedRecord.nid}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Date of Birth:</span>
                <span>{selectedRecord.date_of_birth}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Gender & Blood:</span>
                <span>{selectedRecord.gender} ({selectedRecord.blood_group})</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Contact Number:</span>
                <span>{selectedRecord.contact_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Residential Address:</span>
                <span className="text-right truncate max-w-[240px]">{selectedRecord.address}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Face Recognition Binding:</span>
                <span className={selectedRecord.face_registered ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {selectedRecord.face_registered ? 'OpenCV LBPH Trained' : 'Not Registered'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">R307S Fingerprint Template ID:</span>
                <span className="text-cyan-400 font-bold font-mono">
                  {selectedRecord.fingerprint_id ? `Slot #${selectedRecord.fingerprint_id}` : 'None'}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Total Biometric Access Count:</span>
                <span className="text-white font-bold">{selectedRecord.access_count} Successful Verifications</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Edit Permitted Information</h3>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Full Citizen Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Contact Phone</label>
                <input
                  type="text"
                  value={editFormData.contact_number}
                  onChange={(e) => setEditFormData({ ...editFormData, contact_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Address</label>
                <textarea
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Account Status</label>
                <select
                  value={editFormData.account_status}
                  onChange={(e) => setEditFormData({ ...editFormData, account_status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-rose-500/50 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Confirm Record Deletion</h3>
                <p className="text-[10px] text-slate-400">Permanent biometric purged</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-300">
              Are you sure you want to permanently delete citizen record <strong className="text-white">{deleteConfirmRecord.name}</strong> (NID: <span className="font-mono text-cyan-400">{deleteConfirmRecord.nid}</span>)?
              All trained facial weights and fingerprint bindings will be deleted.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
