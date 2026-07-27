"use client";

import { useState } from 'react';
import { approveB2BRequest, rejectB2BRequest } from './actions';
import { CheckCircle, XCircle } from 'lucide-react';

export default function B2BRequestsClient({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'confirm';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showModal = (title: string, message: string, type: 'success' | 'error' | 'confirm' = 'success', onConfirm?: () => void) => {
    setModalConfig({ isOpen: true, title, message, type, onConfirm });
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleApprove = async (id: string, userId: string) => {
    setProcessingId(id);
    const result = await approveB2BRequest(id, userId);
    setProcessingId(null);
    if (result.success) {
      setRequests(prev => prev.filter(r => r.id !== id));
      showModal("Success", "Application approved! The user can now log in to the B2B portal.", "success");
    } else {
      showModal("Error", result.error || "Failed to approve request.", "error");
    }
  };

  const handleReject = async (id: string) => {
    showModal("Confirm Rejection", "Are you sure you want to reject this application?", "confirm", async () => {
      closeModal();
      setProcessingId(id);
      const result = await rejectB2BRequest(id);
      setProcessingId(null);
      if (result.success) {
        setRequests(prev => prev.filter(r => r.id !== id));
        showModal("Success", "Application rejected.", "success");
      } else {
        showModal("Error", result.error || "Failed to reject request.", "error");
      }
    });
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-500 font-medium">No pending B2B requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-[#FAF8F5] text-gray-700 font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Business / Contact</th>
              <th className="px-6 py-4">Account Info</th>
              <th className="px-6 py-4">Registration Details</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{req.businessName}</div>
                  <div className="text-gray-500 text-xs mt-1">Contact: {req.contactPerson}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{req.user?.name}</div>
                  <div className="text-gray-500 text-xs mt-1">{req.user?.email}</div>
                  <div className="text-gray-500 text-xs">{req.user?.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[13px]"><span className="font-semibold text-gray-700">GST:</span> {req.gstNumber}</div>
                  {req.tradeLicense && (
                    <div className="text-[13px] mt-1"><span className="font-semibold text-gray-700">License:</span> {req.tradeLicense}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleReject(req.id)}
                      disabled={processingId === req.id}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(req.id, req.userId)}
                      disabled={processingId === req.id}
                      className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className={`text-lg font-bold mb-2 ${
                modalConfig.type === 'error' ? 'text-red-600' :
                modalConfig.type === 'success' ? 'text-green-600' :
                'text-gray-900'
              }`}>
                {modalConfig.title}
              </h3>
              <p className="text-gray-600 text-[14px]">
                {modalConfig.message}
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {modalConfig.type === 'confirm' ? 'Cancel' : 'Close'}
              </button>
              {modalConfig.type === 'confirm' && modalConfig.onConfirm && (
                <button 
                  onClick={modalConfig.onConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
