'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { verifyKyc, rejectKyc } from '@/lib/adminActions';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface Document {
  id: string;
  fileUrl: string;
  documentType: string;
  status: string;
  uploadedAt: Date | string;
}

interface KycActionsProps {
  userId: string;
  documents?: Document[];
}

const DOC_TYPE_LABELS: Record<string, string> = {
  id_front: 'ID Front',
  id_back: 'ID Back',
  profile_photo: 'Profile Photo',
};

export function KycActions({ userId, documents = [] }: KycActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>();
  const [actionDocId, setActionDocId] = useState<string | undefined>();

  const handleVerify = async (docId?: string) => {
    setLoading(true);
    await verifyKyc(userId, docId);
    window.location.reload();
  };

  const handleReject = async (docId?: string) => {
    if (!rejectionReason.trim()) return;
    setLoading(true);
    await rejectKyc(userId, rejectionReason, docId || undefined);
    window.location.reload();
  };

  const openRejectModal = (docId?: string) => {
    setSelectedDocId(docId);
    setShowRejectModal(true);
  };

  const openDocActionModal = (docId: string) => {
    setActionDocId(docId);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Document Previews with Actions */}
      {documents.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[8px] font-bold border ${
                doc.status === 'verified' ? 'bg-success-mint/20 border-success-mint/30 text-on-success-mint' :
                doc.status === 'rejected' ? 'bg-error/10 border-error/20 text-error' :
                'bg-primary/10 border-primary/20 text-primary'
              }`}
            >
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <Eye className="w-3 h-3" />
                {DOC_TYPE_LABELS[doc.documentType] || doc.documentType.replace(/_/g, ' ')}
              </a>
              {doc.status === 'pending' && (
                <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-current">
                  <button
                    onClick={() => handleVerify(doc.id)}
                    className="hover:text-on-success-mint"
                    title="Approve"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => openRejectModal(doc.id)}
                    className="hover:text-error/70"
                    title="Reject"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Button
          onClick={() => handleVerify()}
          disabled={loading}
          className="px-4 py-2 text-[10px] uppercase font-bold tracking-wider"
        >
          Approve All
        </Button>
        <Button
          variant="outline"
          onClick={() => openRejectModal()}
          disabled={loading}
          className="px-4 py-2 text-[10px] uppercase font-bold tracking-wider border-error/50 text-error hover:bg-error/10"
        >
          Reject All
        </Button>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl p-6 max-w-md w-full border border-outline-variant/30 shadow-2xl">
            <h3 className="font-manrope font-bold text-lg mb-4">
              {selectedDocId ? 'Reject Document' : 'Reject KYC Submission'}
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Please provide a reason for rejecting {selectedDocId ? 'this document' : 'this KYC submission'}:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none bg-surface-container-lowest text-sm resize-none"
              rows={4}
              placeholder="e.g., Document is blurry, ID has expired, photo doesn't match, etc."
            />
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRejectModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleReject(selectedDocId)}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-error hover:bg-error/80"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}