"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Search, User, Send, CheckCircle2, Clock, XCircle,
  Filter, Loader2, AlertTriangle, Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

type ChatRequest = {
  id: number;
  clientUser: { 
    id: number; firstName: string; lastName: string; email: string;
    role: { name: string };
    client?: { id: number; clientCode: string };
  };
  vetUser: { id: number; firstName: string; lastName: string; role: { name: string } };
  status: string;
  reason?: string;
  declineReason?: string;
  escalatedFromBot: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
};

type Message = {
  id: number;
  senderId: number;
  body: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: number; firstName: string; lastName: string; role: { name: string } };
};

const API_BASE = () => {
  let base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
  if (!base.startsWith("http")) base = `https://${base}`;
  return base;
};

const getToken = () => localStorage.getItem("vcms_token");
const getUser = () => {
  try { return JSON.parse(localStorage.getItem("vcms_user") || "null"); } catch { return null; }
};

export default function VetMessagesPage() {
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<ChatRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(getUser());
    fetchRequests();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  useEffect(() => {
    if (activeRequest && activeRequest.status === "Approved") {
      fetchMessages(activeRequest.id);
    }
  }, [activeRequest]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling for messages in active conversation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeRequest && activeRequest.status === "Approved") {
      interval = setInterval(() => fetchMessages(activeRequest.id), 3000);
    }
    return () => clearInterval(interval);
  }, [activeRequest]);

  // ── DATA FETCHING ──

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE()}/api/chat-requests/vet-inbox?filter=${filter}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) setRequests(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (chatRequestId: number) => {
    try {
      const res = await fetch(`${API_BASE()}/api/chat-requests/${chatRequestId}/messages`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) setMessages(await res.json());
    } catch (err) { console.error(err); }
  };

  // ── ACTIONS (REQ087, REQ088) ──

  const handleAccept = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`${API_BASE()}/api/chat-requests/${requestId}/accept`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const updated = await res.json();
        fetchRequests();
        if (activeRequest?.id === requestId) {
          setActiveRequest(updated);
        }
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleDecline = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`${API_BASE()}/api/chat-requests/${requestId}/decline`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ declineReason: "Doctor is currently unavailable" })
      });
      if (res.ok) {
        fetchRequests();
        if (activeRequest?.id === requestId) {
          setActiveRequest(null);
          setMessages([]);
        }
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  // ── SEND MESSAGE (REQ089) ──

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeRequest || sending) return;

    const text = replyText;
    setReplyText("");
    setSending(true);

    try {
      const res = await fetch(`${API_BASE()}/api/chat-requests/${activeRequest.id}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ body: text })
      });
      if (res.ok) {
        fetchMessages(activeRequest.id);
        fetchRequests();
      }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  // ── STATUS BADGE ──
  const StatusBadge = ({ status, escalated }: { status: string; escalated?: boolean }) => (
    <div className="flex items-center gap-1.5">
      {status === "Pending" && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="w-3 h-3" /> Pending</span>}
      {status === "Approved" && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Active</span>}
      {status === "Declined" && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3" /> Declined</span>}
      {escalated && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"><Bot className="w-3 h-3" /> Escalated</span>}
    </div>
  );

  // ── FILTER ──
  const filteredRequests = requests.filter(r => {
    if (!searchTerm) return true;
    const name = `${r.clientUser.firstName} ${r.clientUser.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || r.clientUser.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const pendingCount = requests.filter(r => r.status === "Pending").length;
  const escalatedCount = requests.filter(r => r.escalatedFromBot).length;

  if (loading) return <div className="py-20 text-center text-neutral-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading inbox...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 pb-6">

      {/* ── SIDEBAR: Requests List (REQ084) ── */}
      <div className="w-[360px] flex flex-col card overflow-hidden shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" /> Client Inquiries
            </h2>
            {pendingCount > 0 && (
              <span className="w-6 h-6 rounded-full bg-danger text-white text-xs font-bold flex items-center justify-center animate-pulse">
                {pendingCount}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search clients..." 
              className="input pl-9 w-full bg-neutral-50 dark:bg-neutral-900 border-none text-sm" 
            />
          </div>

          {/* Filter tabs (REQ086) */}
          <div className="flex gap-1 overflow-x-auto">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: `Pending (${pendingCount})` },
              { key: "approved", label: "Active" },
              { key: "escalated", label: `Escalated (${escalatedCount})` },
              { key: "declined", label: "Declined" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors",
                  filter === tab.key
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Request list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredRequests.length === 0 ? (
            <div className="p-10 text-center text-neutral-500 text-sm">No chat requests found.</div>
          ) : (
            filteredRequests.map((req) => (
              <button
                key={req.id}
                onClick={() => setActiveRequest(req)}
                className={cn(
                  "w-full text-left p-3 rounded-xl flex gap-3 transition-colors",
                  activeRequest?.id === req.id 
                    ? "bg-primary-50 dark:bg-primary-500/10" 
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                )}
              >
                <div className="relative shrink-0">
                  <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center",
                    req.status === "Pending" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" :
                    req.status === "Approved" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" :
                    "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                  )}>
                    <User className="w-5 h-5" />
                  </div>
                  {req.escalatedFromBot && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center border-2 border-white dark:border-neutral-900">
                      <Bot className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={cn("text-sm font-bold truncate", activeRequest?.id === req.id ? "text-primary-600 dark:text-primary-400" : "")}>
                      {req.clientUser.firstName} {req.clientUser.lastName}
                    </h3>
                    <span className="text-[10px] text-neutral-400 whitespace-nowrap ml-2">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <StatusBadge status={req.status} escalated={req.escalatedFromBot} />
                  {req.reason && (
                    <p className="text-[11px] text-neutral-500 mt-1 truncate">{req.reason}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col card overflow-hidden">
        {activeRequest ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white/50 dark:bg-neutral-900/50 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0",
                  activeRequest.status === "Approved" ? "bg-emerald-500" :
                  activeRequest.status === "Pending" ? "bg-amber-500" : "bg-neutral-400"
                )}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {activeRequest.clientUser.firstName} {activeRequest.clientUser.lastName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={activeRequest.status} escalated={activeRequest.escalatedFromBot} />
                    <span className="text-[10px] text-neutral-400">{activeRequest.clientUser.email}</span>
                  </div>
                </div>
              </div>

              {/* Accept / Decline buttons (REQ087, REQ088) */}
              {activeRequest.status === "Pending" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(activeRequest.id)}
                    disabled={actionLoading === activeRequest.id}
                    className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    {actionLoading === activeRequest.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(activeRequest.id)}
                    disabled={actionLoading === activeRequest.id}
                    className="btn text-xs px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 flex items-center gap-1.5 rounded-xl font-semibold transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              )}
            </div>

            {/* ── Pending State ── */}
            {activeRequest.status === "Pending" && (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8">
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                  <Clock className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="font-bold text-lg text-neutral-600 dark:text-neutral-300 mb-2">Pending Chat Request</h3>
                <p className="text-sm text-center max-w-md">
                  <strong>{activeRequest.clientUser.firstName} {activeRequest.clientUser.lastName}</strong> has requested to chat with you.
                  {activeRequest.reason && <><br /><br />Reason: <em>"{activeRequest.reason}"</em></>}
                  {activeRequest.escalatedFromBot && <><br /><br /><span className="text-orange-500 font-semibold">⚠ This was escalated from the FAQ chatbot.</span></>}
                </p>
                <p className="text-xs text-neutral-400 mt-4">Use the Accept / Decline buttons above to respond.</p>
              </div>
            )}

            {/* ── Declined State ── */}
            {activeRequest.status === "Declined" && (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="font-bold text-lg text-neutral-600 dark:text-neutral-300 mb-2">Request Declined</h3>
                <p className="text-sm text-neutral-500">This chat request was declined.</p>
              </div>
            )}

            {/* ── Approved: Conversation (REQ085, REQ089) ── */}
            {activeRequest.status === "Approved" && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/20 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
                      Chat is active. Send a message to {activeRequest.clientUser.firstName}!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id;
                      return (
                        <div key={msg.id} className={cn("flex flex-col max-w-[70%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                          {!isMe && (
                            <p className="text-[10px] font-bold text-neutral-500 mb-0.5 ml-1">
                              {msg.sender.firstName} {msg.sender.lastName}
                            </p>
                          )}
                          <div className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap shadow-sm",
                            isMe 
                              ? "bg-primary-500 text-white rounded-br-sm" 
                              : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-bl-sm"
                          )}>
                            {msg.body}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && (
                              msg.isRead ? <CheckCircle2 className="w-3 h-3 text-primary-500" /> : <Clock className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input (REQ089) */}
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0 bg-white dark:bg-neutral-900">
                  <form onSubmit={handleSend} className="flex items-end gap-2">
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      placeholder="Type a message..."
                      className="input flex-1 resize-none h-12 py-3 rounded-2xl"
                    />
                    <button 
                      type="submit" 
                      disabled={!replyText.trim() || sending}
                      className="btn btn-primary h-12 w-12 rounded-2xl p-0 flex items-center justify-center shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-semibold text-lg text-neutral-600 dark:text-neutral-300">Client Inquiry & Chat</p>
            <p className="text-sm">Select a chat request from the sidebar to view or respond.</p>
          </div>
        )}
      </div>
    </div>
  );
}
