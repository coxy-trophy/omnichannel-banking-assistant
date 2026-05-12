'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Send, MessageSquare, User, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { sendAdminMessage, getComplaintWithMessages, resolveComplaint } from '@/lib/adminActions';

interface Message {
  id: string;
  complaintId: string;
  senderId: string;
  message: string;
  createdAt: Date | string;
}

interface Complaint {
  id: string;
  category: string;
  message: string;
  status: string;
  createdAt: Date | string;
  user: {
    email: string;
    phone?: string;
  };
  messages: Message[];
}

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [complaintId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    const data = await getComplaintWithMessages(complaintId);
    if (data) {
      setComplaint(data as Complaint);
      setMessages(data.messages.reverse());
    }
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const result = await sendAdminMessage(complaintId, newMessage);

    if (result.success) {
      setNewMessage('');
      await loadData();
    }
    setSending(false);
  };

  const handleResolve = async () => {
    setResolving(true);
    await resolveComplaint(complaintId);
    await loadData();
    setResolving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
        <Card className="max-w-md w-full text-center py-12 border-none shadow-2xl">
          <h1 className="font-manrope text-2xl font-bold mb-2 text-primary">Complaint Not Found</h1>
          <Link href="/admin/complaints">
            <Button>Back to Complaints</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-error/10 text-error border-error/20' },
    resolved: { label: 'Resolved', className: 'bg-success-mint text-on-success-mint border-success-mint/50' },
  };

  const status = statusConfig[complaint.status] || statusConfig.open;

  return (
    <div className="min-h-screen bg-background p-8 font-inter text-on-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/complaints" className="p-2 hover:bg-surface-container rounded-xl transition-all border border-transparent hover:border-outline-variant/30">
              <ArrowLeft className="w-6 h-6 text-primary" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-manrope text-2xl font-bold text-primary">{complaint.category}</h1>
                <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Ticket #{complaint.id.slice(0, 8)} &bull; {new Date(complaint.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-outline">Customer</p>
              <p className="text-sm font-bold">{complaint.user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <Card className="overflow-hidden border-outline-variant/30 shadow-xl">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-outline mx-auto mb-4" />
                  <p className="text-on-surface-variant font-medium">No messages yet</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isAdmin = msg.senderId === 'admin';
                const isLastFromSender = index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isAdmin
                          ? 'bg-primary text-on-primary rounded-br-sm'
                          : 'bg-surface-container text-on-surface rounded-bl-sm'
                      }`}
                    >
                      {isAdmin && (
                        <p className="text-[8px] uppercase tracking-widest mb-1 opacity-70">Support Team</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      {isLastFromSender && (
                        <p className={`text-[9px] mt-1 ${isAdmin ? 'text-on-primary/70' : 'text-outline'}`}>
                          {new Date(msg.createdAt).toLocaleString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Bar */}
          <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest">
            {complaint.status === 'resolved' && (
              <div className="mb-3 p-2 bg-success-mint/10 border border-success-mint/20 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-on-success-mint" />
                <p className="text-xs text-on-success-mint font-medium">
                  This ticket has been resolved. Send a message to reopen.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 px-4 h-12 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none bg-surface-container text-sm"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
              {complaint.status !== 'resolved' && (
                <Button
                  onClick={handleResolve}
                  disabled={resolving}
                  variant="outline"
                  className="px-6 border-success-mint/50 text-on-success-mint hover:bg-success-mint/10"
                >
                  {resolving ? 'Resolving...' : 'Resolve'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
