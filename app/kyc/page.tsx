'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, ArrowLeft, MessageSquare, Upload, CheckCircle2, Clock, AlertCircle, Send, FileText, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { getKycStatus, submitKyc, contactSupport } from './actions';

const DOCUMENT_TYPES = [
  { value: 'id_front', label: 'ID Card (Front)', required: true },
  { value: 'id_back', label: 'ID Card (Back)', required: true },
  { value: 'profile_photo', label: 'Profile Photo', required: true },
];

interface Document {
  id: string;
  fileUrl: string;
  documentType: string;
  status: string;
  uploadedAt: Date | string;
  rejectionReason?: string | null;
}

export default function KycPage() {
  const [kycStatus, setKycStatus] = useState<string>('pending');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  // Track upload state for each document type
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [activeUploadType, setActiveUploadType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const result = await getKycStatus();
    if (result?.user) {
      setKycStatus(result.user.kycStatus);
      setDocuments(result.documents || []);
    }
    setLoading(false);
  };

  const getDocumentByType = (type: string) => {
    return documents.find(doc => doc.documentType === type);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - only images for KYC
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Only JPG or PNG image files are allowed');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }
      setUploadError('');
      setSelectedFile(file);
      // Create preview for images
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (docType: string) => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', docType);

    const result = await submitKyc(formData);
    if (result.success) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setActiveUploadType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadStatus();
    } else {
      setUploadError(result.error || 'Upload failed');
    }
    setSubmitting(false);
  };

  const startUpload = (docType: string) => {
    setActiveUploadType(docType);
    setSelectedDocType(docType);
    setUploadError('');
  };

  const cancelUpload = () => {
    setActiveUploadType(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleContactSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await contactSupport(supportMessage);
    if (result.success) {
      setSupportSent(true);
      setSupportMessage('');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading verification status...</p>
        </div>
      </div>
    );
  }

  const hasDocuments = documents.length > 0;
  const allUploaded = DOCUMENT_TYPES.every(type => getDocumentByType(type.value));

  const statusConfig: Record<string, { icon: React.ReactNode; title: string; desc: string; color: string }> = {
    pending: hasDocuments ? {
      icon: <Clock className="w-8 h-8" />,
      title: 'Verification in Progress',
      desc: 'Your documents are being reviewed. This typically takes 24-48 hours.',
      color: 'text-tertiary bg-tertiary-fixed/30'
    } : {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: 'Verify Your Identity',
      desc: 'Submit your identification documents to unlock full access to all institutional services.',
      color: 'text-primary bg-primary/10'
    },
    verified: {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: 'Identity Verified',
      desc: 'Your account has full access to all institutional services.',
      color: 'text-on-success-mint bg-success-mint'
    },
    rejected: hasDocuments ? {
      icon: <AlertCircle className="w-8 h-8" />,
      title: 'Documents Rejected',
      desc: 'Some of your documents were rejected. Please check the reason below and re-upload.',
      color: 'text-error bg-error/10'
    } : {
      icon: <AlertCircle className="w-8 h-8" />,
      title: 'Verification Required',
      desc: 'Please submit your identification documents to verify your account.',
      color: 'text-error bg-error/10'
    }
  };

  const config = statusConfig[kycStatus] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center text-on-background font-inter">
      <div className="max-w-2xl w-full">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-surface-container rounded-xl transition-all border border-transparent hover:border-outline-variant/30">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Link>
          <div className="flex-1">
            <h1 className="font-manrope text-2xl font-bold text-primary tracking-tight">Identity Verification</h1>
            <p className="text-xs text-on-surface-variant font-medium">KYC compliance for institutional access</p>
          </div>
        </header>

        {supportSent ? (
          <Card className="max-w-md w-full text-center py-12 border-none shadow-2xl mx-auto">
            <div className="bg-success-mint w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-on-success-mint w-10 h-10" />
            </div>
            <h2 className="font-manrope text-2xl font-bold mb-2 text-primary">Message Sent</h2>
            <p className="text-on-surface-variant mb-6 font-medium">
              Our support team will respond to your inquiry shortly.
            </p>
            <Button onClick={() => { setSupportSent(false); setShowSupport(false); }}>
              Back to KYC
            </Button>
          </Card>
        ) : showSupport ? (
          <Card className="border-outline-variant/30 shadow-lg">
            <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="font-manrope text-xl font-bold">Contact Support</h2>
            </div>
            <form onSubmit={handleContactSupport} className="p-6 space-y-6">
              <p className="text-sm text-on-surface-variant">
                Having trouble with your KYC verification? Let us know and we'll help you resolve it.
              </p>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Describe Your Issue</label>
                <textarea
                  required
                  rows={4}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none bg-surface-container-lowest font-medium resize-none"
                  placeholder="e.g., I'm having trouble uploading my ID photo..."
                />
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setShowSupport(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <>
            {/* Status Card */}
            <Card className="p-8 border-outline-variant/30 shadow-lg mb-6">
              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${config.color}`}>
                  {config.icon}
                </div>
                <h2 className="font-manrope text-2xl font-bold mb-2">{config.title}</h2>
                <p className="text-on-surface-variant mb-6 font-medium max-w-md">
                  {config.desc}
                </p>
              </div>
            </Card>

            {/* Required Documents List */}
            <Card className="p-6 border-outline-variant/30 shadow-lg mb-6">
              <h3 className="font-manrope font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Required KYC Documents
              </h3>
              <p className="text-sm text-on-surface-variant mb-4">
                All three documents are required to complete your identity verification.
              </p>
              <div className="space-y-4">
                {DOCUMENT_TYPES.map((docType) => {
                  const uploadedDoc = getDocumentByType(docType.value);
                  const isActiveUpload = activeUploadType === docType.value;

                  return (
                    <div key={docType.value} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            uploadedDoc?.status === 'verified' ? 'bg-success-mint/20' : 'bg-primary/10'
                          }`}>
                            <FileText className={`w-5 h-5 ${
                              uploadedDoc?.status === 'verified' ? 'text-on-success-mint' : 'text-primary'
                            }`} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{docType.label}</p>
                            {uploadedDoc ? (
                              <p className="text-[10px] text-outline">
                                Uploaded {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                              </p>
                            ) : (
                              <p className="text-[10px] text-error font-bold">Not uploaded</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {uploadedDoc ? (
                            <>
                              <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                                uploadedDoc.status === 'verified' ? 'bg-success-mint text-on-success-mint' :
                                uploadedDoc.status === 'rejected' ? 'bg-error/10 text-error' :
                                'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant'
                              }`}>
                                {uploadedDoc.status}
                              </span>
                              <a
                                href={uploadedDoc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4 text-primary" />
                              </a>
                            </>
                          ) : (
                            <Button
                              onClick={() => startUpload(docType.value)}
                              className="text-[10px] px-3 py-1 h-auto"
                            >
                              Upload
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Upload form for active document */}
                      {isActiveUpload && (
                        <div className="mt-4 pt-4 border-t border-outline-variant/20">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">
                                Upload {docType.label}
                              </label>
                              <div
                                className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-surface-container-lowest"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  className="hidden"
                                />
                                <Upload className="w-8 h-8 text-outline mx-auto mb-2" />
                                <p className="text-sm font-medium text-on-surface">
                                  {selectedFile && activeUploadType === docType.value
                                    ? selectedFile.name
                                    : 'Click to upload'}
                                </p>
                                <p className="text-[10px] text-outline mt-1">
                                  JPG or PNG (max 5MB)
                                </p>
                              </div>
                            </div>

                            {previewUrl && activeUploadType === docType.value && (
                              <div className="relative">
                                <img
                                  src={previewUrl}
                                  alt="Preview"
                                  className="w-full h-48 object-cover rounded-xl border border-outline-variant/30"
                                />
                                <button
                                  type="button"
                                  onClick={cancelUpload}
                                  className="absolute top-2 right-2 p-2 bg-error text-white rounded-full hover:bg-error/80 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {uploadError && activeUploadType === docType.value && (
                              <div className="flex items-center gap-2 text-error bg-error/10 p-3 rounded-xl">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-bold text-sm">{uploadError}</span>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={cancelUpload}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleUpload(docType.value)}
                                disabled={submitting || !selectedFile || activeUploadType !== docType.value}
                                className="flex-1"
                              >
                                {submitting ? 'Uploading...' : `Upload ${docType.label}`}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Check if all documents are uploaded */}
              {(() => {
                const allUploaded = DOCUMENT_TYPES.every(
                  type => getDocumentByType(type.value)
                );
                const allVerified = DOCUMENT_TYPES.every(
                  type => getDocumentByType(type.value)?.status === 'verified'
                );

                if (allUploaded && kycStatus !== 'pending' && kycStatus !== 'verified') {
                  return (
                    <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-sm font-bold text-primary mb-1">Ready for Review</p>
                      <p className="text-xs text-on-surface-variant">
                        All documents have been uploaded. Your KYC is {kycStatus === 'rejected' ? 'pending re-review' : 'pending review'}.
                      </p>
                    </div>
                  );
                }

                if (allVerified) {
                  return (
                    <div className="mt-4 p-4 rounded-xl bg-success-mint/10 border border-success-mint/20">
                      <p className="text-sm font-bold text-on-success-mint mb-1">Verification Complete</p>
                      <p className="text-xs text-on-success-mint">
                        All your documents have been verified. You have full access to all services.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              {kycStatus === 'rejected' && (
                <div className="mt-4 p-4 rounded-xl bg-error/10 border border-error/20">
                  <p className="text-sm font-bold text-error mb-1">Rejection Reason:</p>
                  <p className="text-xs text-on-surface-variant">
                    {documents.find(d => d.status === 'rejected')?.rejectionReason || 'Please re-upload the rejected documents'}
                  </p>
                </div>
              )}
            </Card>

            {/* Help Card */}
            <Card className="p-6 border-outline-variant/30 bg-surface-container-low mt-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Need Help?</h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    If you're having trouble with document upload or have questions about verification requirements, our support team is here to help.
                  </p>
                  <Button variant="outline" onClick={() => setShowSupport(true)} className="gap-2">
                    Contact Support
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}