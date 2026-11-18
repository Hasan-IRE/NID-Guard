import React, { useState, useEffect } from 'react';
import { DemoNidRecord, BiometricStatus, AccountStatus } from '../../types/nid';
import { Modal } from '../common/Modal';
import { ShieldCheck, Plus, Check } from 'lucide-react';

interface NIDFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DemoNidRecord>) => void;
  recordToEdit?: DemoNidRecord | null;
}

export const NIDFormModal: React.FC<NIDFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  recordToEdit,
}) => {
  const [formData, setFormData] = useState<Partial<DemoNidRecord>>({
    name: '',
    demo_nid_number: '',
    date_of_birth: '1998-05-14',
    address: 'Dhaka, Bangladesh',
    blood_group: 'B+',
    father_name: '',
    mother_name: '',
    biometric_status: 'Registered',
    account_status: 'Active',
  });

  useEffect(() => {
    if (recordToEdit) {
      setFormData(recordToEdit);
    } else {
      setFormData({
        name: '',
        demo_nid_number: 'DEMO-' + Math.floor(100000000 + Math.random() * 900000000),
        date_of_birth: '1998-05-14',
        address: 'Sector 4, Uttara, Dhaka, Bangladesh',
        blood_group: 'B+',
        father_name: 'Fictional Father',
        mother_name: 'Fictional Mother',
        biometric_status: 'Registered',
        account_status: 'Active',
      });
    }
  }, [recordToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordToEdit ? `Edit Synthetic Record: ${recordToEdit.record_id}` : 'Enroll New Synthetic Demo Record'}
      subtitle="Creates a simulated encrypted citizen identity record for testing"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-300 text-[11px]">
          Note: All records created here are marked with <code>is_synthetic: true</code> and isolated in prototype storage.
        </div>

        <div>
          <label className="block text-slate-400 text-[11px] uppercase mb-1">
            Citizen Full Name (Synthetic) *
          </label>
          <input
            type="text"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Rahim Ahmed"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 text-[11px] uppercase mb-1">
              Demo NID Number
            </label>
            <input
              type="text"
              required
              value={formData.demo_nid_number || ''}
              onChange={(e) => setFormData({ ...formData, demo_nid_number: e.target.value })}
              placeholder="DEMO-784512963"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] uppercase mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              required
              value={formData.date_of_birth || ''}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-[11px] uppercase mb-1">
            Address (Synthetic)
          </label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. Uttara, Dhaka, Bangladesh"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 text-[11px] uppercase mb-1">
              Blood Group
            </label>
            <select
              value={formData.blood_group || 'O+'}
              onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] uppercase mb-1">
              Biometric Status
            </label>
            <select
              value={formData.biometric_status || 'Registered'}
              onChange={(e) =>
                setFormData({ ...formData, biometric_status: e.target.value as BiometricStatus })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
            >
              <option value="Registered">Registered</option>
              <option value="Not Registered">Not Registered</option>
              <option value="Pending Verification">Pending Verification</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] uppercase mb-1">
              Account Status
            </label>
            <select
              value={formData.account_status || 'Active'}
              onChange={(e) =>
                setFormData({ ...formData, account_status: e.target.value as AccountStatus })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
            >
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow flex items-center gap-1.5"
          >
            {recordToEdit ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Register Demo Record
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
