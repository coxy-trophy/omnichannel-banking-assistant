'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Send, MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getComplaintMessages, sendMessage, getComplaintById } from '../actions';

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
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [complaintId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    const [complaintData, messagesData] = await Promise.all([
      getComplaintById(complaintId),
      getComplaintMessages(complaintId),
    ]);

    if (complaintData) {
      setComplaint(complaintData);
    }
    setMessages(messagesData.reverse()); // Show oldest first for chat view

    // Get current user ID from first message or complaint
    if (messagesData.length > 0) {
      setCurrentUser(messagesData[0].senderId);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const result = await sendMessage(complaintId, newMessage);

    if (result.success) {
      setNewMessage('');
      await loadData();
    }
    setSending(false);
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
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h1 className="font-manrope text-2xl font-bold mb-2 text-primary">Complaint Not Found</h1>
          <p className="text-on-surface-variant mb-6">
            This complaint does not exist or you do not have access to it.
          </p>
          <Link href="/complaints">
            <Button>Back to Support</Button>
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
    <div className="min-h-screen bg-background p-6 flex flex-col text-on-background font-inter">
      <div className="max-w-3xl w-full mx-auto flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <header className="mb-4 flex items-center gap-4 flex-shrink-0">
          <Link href="/complaints" className="p-2 hover:bg-surface-container rounded-xl transition-all border border-transparent hover:border-outline-variant/30">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-manrope text-xl font-bold text-primary tracking-tight">{complaint.category}</h1>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${status.className}`}>
                {status.label}
              </span>
            </div>
            <p className="text-[10px] text-outline">
              Created {new Date(complaint.createdAt).toLocaleDateString()}
            </p>
          </div>
        </header>

        {/* Messages Container */}
        <Card className="flex-1 flex flex-col overflow-hidden border-outline-variant/30 shadow-lg">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-outline mx-auto mb-4" />
                  <p className="text-on-surface-variant font-medium">No messages yet</p>
                  <p className="text-xs text-outline mt-1">Be the first to send a message</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isCurrentUser = msg.senderId === currentUser;
                const isLastFromSender = index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isCurrentUser
                          ? 'bg-primary text-on-primary rounded-br-sm'
                          : 'bg-surface-container text-on-surface rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      {isLastFromSender && (
                        <p className={`text-[9px] mt-1 ${isCurrentUser ? 'text-on-primary/70' : 'text-outline'}`}>
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

          {/* Reply Form */}
          <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest">
            {complaint.status === 'resolved' && (
              <div className="mb-3 p-2 bg-success-mint/10 border border-success-mint/20 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-on-success-mint" />
                <p className="text-xs text-on-success-mint font-medium">
                  This ticket has been resolved. Send a message to reopen it.
                </p>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
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
          </div>
        </Card>
      </div>
    </div>
  );
}
