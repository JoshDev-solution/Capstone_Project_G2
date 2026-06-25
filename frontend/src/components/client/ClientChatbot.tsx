"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, X, Send, Bot, User, ChevronRight, Stethoscope, 
  ArrowLeft, CheckCircle2, Clock, XCircle, Loader2, History 
} from "lucide-react";
import { cn } from "@/lib/utils";

type BotMessage = {
  id: string;
  type: "user" | "bot";
  text: string;
  isWidget?: boolean;
  widgetOptions?: { label: string; action: () => void }[];
};

type ChatRequestType = {
  id: number;
  vetUser: { id: number; firstName: string; lastName: string; role: { name: string } };
  status: string;
  reason?: string;
  createdAt: string;
  _count: { messages: number };
};

type LiveMessage = {
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

export default function ClientChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"bot" | "vets_list" | "request_status" | "live_chat" | "history">("bot");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Bot State (REQ178, REQ179, REQ180)
  const [botMessages, setBotMessages] = useState<BotMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Chat Request State (REQ181, REQ182)
  const [vets, setVets] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<ChatRequestType[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ChatRequestType | null>(null);

  // Live Chat State (REQ183, REQ184)
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [liveInput, setLiveInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setCurrentUser(getUser());
  }, []);

  // Initialize bot welcome message with quick-reply options (REQ179)
  useEffect(() => {
    if (botMessages.length === 0) {
      setBotMessages([{
        id: "welcome",
        type: "bot",
        text: "Hello! 🐾 I'm LJ Vet Clinic's assistant. How can I help you today?",
        isWidget: true,
        widgetOptions: [
          { label: "🕐 Clinic Hours", action: () => handleBotAction("Clinic Hours") },
          { label: "📍 Location & Contact", action: () => handleBotAction("Location") },
          { label: "📅 How to Book", action: () => handleBotAction("Book Appointment") },
          { label: "💊 Services & Pricing", action: () => handleBotAction("Services") },
          { label: "🩺 Chat with a Doctor", action: () => switchToVetsList() },
          { label: "📋 My Chat Requests", action: () => switchToHistory() },
        ]
      }]);
    }
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages, liveMessages, isOpen, mode]);

  // Polling for live messages when in live chat
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && mode === "live_chat" && selectedRequest && selectedRequest.status === "Approved") {
      fetchLiveMessages(selectedRequest.id);
      interval = setInterval(() => fetchLiveMessages(selectedRequest.id), 3000);
    }
    return () => clearInterval(interval);
  }, [isOpen, mode, selectedRequest]);

  // ── BOT LOGIC (REQ178, REQ179, REQ180) ──

  const addBotMessage = (msg: Omit<BotMessage, "id">) => {
    setBotMessages(prev => [...prev, { ...msg, id: `bot-${Date.now()}-${Math.random()}` }]);
  };

  const handleBotAction = (action: string) => {
    addBotMessage({ type: "user", text: action });

    setTimeout(() => {
      switch (action) {
        case "Clinic Hours":
          addBotMessage({ 
            type: "bot", 
            text: "🕐 Our clinic hours are:\n\n• Monday–Friday: 8:00 AM – 6:00 PM\n• Saturday: 9:00 AM – 4:00 PM\n• Sunday: Closed\n\nFor emergencies outside these hours, please call (555) 123-4567.",
            isWidget: true,
            widgetOptions: [
              { label: "📍 Location & Contact", action: () => handleBotAction("Location") },
              { label: "🩺 Chat with a Doctor", action: () => switchToVetsList() },
            ]
          });
          break;
        case "Location":
          addBotMessage({ 
            type: "bot", 
            text: "📍 We are located at:\n\n123 Pet Friendly Ave, San Jose City\n(Near the central park)\n\n📞 Phone: (555) 123-4567\n📧 Email: info@ljvetclinic.com",
            isWidget: true,
            widgetOptions: [
              { label: "🕐 Clinic Hours", action: () => handleBotAction("Clinic Hours") },
              { label: "🩺 Chat with a Doctor", action: () => switchToVetsList() },
            ]
          });
          break;
        case "Book Appointment":
          addBotMessage({ 
            type: "bot", 
            text: "📅 To book an appointment:\n\n1. Click 'Appointments' in your sidebar\n2. Select your pet\n3. Choose a service and available time\n4. Confirm your booking!\n\nYou'll receive a confirmation once it's scheduled.",
            isWidget: true,
            widgetOptions: [
              { label: "💊 Services & Pricing", action: () => handleBotAction("Services") },
              { label: "🩺 Chat with a Doctor", action: () => switchToVetsList() },
            ]
          });
          break;
        case "Services":
          addBotMessage({ 
            type: "bot", 
            text: "💊 Our services include:\n\n• General Consultation\n• Vaccination\n• Deworming\n• Surgery\n• Dental Cleaning\n• Laboratory Tests\n• Grooming\n\nVisit the 'Products' page for retail items. For pricing details, please chat with a doctor.",
            isWidget: true,
            widgetOptions: [
              { label: "📅 How to Book", action: () => handleBotAction("Book Appointment") },
              { label: "🩺 Chat with a Doctor", action: () => switchToVetsList() },
            ]
          });
          break;
        default:
          addBotMessage({ 
            type: "bot", 
            text: "I'm sorry, I'm just an automated FAQ assistant and may not have the answer to that. Would you like to chat with a real doctor?",
            isWidget: true,
            widgetOptions: [
              { label: "🩺 Chat with a Doctor", action: () => switchToVetsList() },
              { label: "📋 My Chat Requests", action: () => switchToHistory() },
            ]
          });
      }
    }, 500);
  };

  const handleBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    addBotMessage({ type: "user", text: userText });
    setInputValue("");

    setTimeout(() => {
      const lower = userText.toLowerCase();
      if (lower.includes("hour") || lower.includes("time") || lower.includes("open") || lower.includes("close")) {
        addBotMessage({ type: "bot", text: "🕐 Our clinic hours are:\n• Mon–Fri: 8:00 AM – 6:00 PM\n• Saturday: 9:00 AM – 4:00 PM\n• Sunday: Closed" });
      } else if (lower.includes("where") || lower.includes("location") || lower.includes("address") || lower.includes("contact") || lower.includes("phone")) {
        addBotMessage({ type: "bot", text: "📍 123 Pet Friendly Ave, San Jose City\n📞 (555) 123-4567" });
      } else if (lower.includes("book") || lower.includes("schedule") || lower.includes("appointment")) {
        addBotMessage({ type: "bot", text: "📅 Go to 'Appointments' in your sidebar to book. Choose your pet, a service, and a time slot!" });
      } else if (lower.includes("vet") || lower.includes("doctor") || lower.includes("chat") || lower.includes("talk") || lower.includes("help")) {
        addBotMessage({ 
          type: "bot", 
          text: "It sounds like you'd like to speak with a doctor directly. Let me connect you!",
          isWidget: true,
          widgetOptions: [{ label: "🩺 Chat with a Doctor", action: () => switchToVetsList() }]
        });
      } else {
        addBotMessage({ 
          type: "bot", 
          text: "Thanks for your message! I'm an automated FAQ bot, so I may not understand everything. For detailed questions, please chat with a doctor directly.",
          isWidget: true,
          widgetOptions: [
            { label: "🩺 Chat with a Doctor", action: () => switchToVetsList() },
            { label: "📋 My Chat Requests", action: () => switchToHistory() },
          ]
        });
      }
    }, 500);
  };

  // ── VET LIST & CHAT REQUEST LOGIC (REQ181) ──

  const switchToVetsList = () => {
    setMode("vets_list");
    fetchVets();
  };

  const switchToHistory = () => {
    setMode("history");
    fetchMyRequests();
  };

  const fetchVets = async () => {
    try {
      const res = await fetch(`${API_BASE()}/api/users/list`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const users = await res.json();
        // The /list endpoint returns {id, name, email, role, status} format
        setVets(users.filter((u: any) => {
          const role = (u.role || "").toLowerCase();
          return role === "veterinarian" || role === "vet" || role === "admin";
        }));
      }
    } catch (err) { console.error(err); }
  };

  const sendChatRequest = async (vetUserId: number, escalated = false) => {
    try {
      const res = await fetch(`${API_BASE()}/api/chat-requests`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ vetUserId, reason: "Client initiated chat", escalatedFromBot: escalated })
      });
      if (res.ok) {
        const request = await res.json();
        setSelectedRequest(request);
        setMode("request_status");
        fetchMyRequests();
      }
    } catch (err) { console.error(err); }
  };

  // ── MY REQUESTS / STATUS (REQ182) ──

  const fetchMyRequests = async () => {
    try {
      const res = await fetch(`${API_BASE()}/api/chat-requests/my-requests`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) setMyRequests(await res.json());
    } catch (err) { console.error(err); }
  };

  const openRequest = (req: ChatRequestType) => {
    setSelectedRequest(req);
    if (req.status === "Approved") {
      setMode("live_chat");
    } else {
      setMode("request_status");
    }
  };

  // ── LIVE CHAT (REQ183, REQ184) ──

  const fetchLiveMessages = async (chatRequestId: number) => {
    try {
      const res = await fetch(`${API_BASE()}/api/chat-requests/${chatRequestId}/messages`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) setLiveMessages(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleLiveSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveInput.trim() || !selectedRequest || sending) return;

    const text = liveInput;
    setLiveInput("");
    setSending(true);

    try {
      const res = await fetch(`${API_BASE()}/api/chat-requests/${selectedRequest.id}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ body: text })
      });
      if (res.ok) {
        fetchLiveMessages(selectedRequest.id);
      }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  // ── STATUS BADGE ──
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "Pending") return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="w-3 h-3" /> Pending</span>;
    if (status === "Approved") return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3" /> Declined</span>;
  };

  // ── HEADER TITLE ──
  const headerTitle = () => {
    switch (mode) {
      case "bot": return "Clinic Assistant";
      case "vets_list": return "Select a Doctor";
      case "request_status": return "Request Status";
      case "live_chat": return `Dr. ${selectedRequest?.vetUser?.lastName || "Vet"}`;
      case "history": return "My Chat History";
    }
  };

  const headerSubtitle = () => {
    switch (mode) {
      case "bot": return "FAQ Bot • Quick Replies";
      case "vets_list": return "Request a Direct Chat";
      case "request_status": return selectedRequest?.status || "...";
      case "live_chat": return "Live Conversation";
      case "history": return "All Requests";
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-lg shadow-primary-500/30 flex items-center justify-center text-white z-40 transition-all duration-200",
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[380px] h-[540px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-neutral-200 dark:border-neutral-800"
          >
            {/* ── Header ── */}
            <div className="gradient-primary p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                {mode !== "bot" && (
                  <button 
                    onClick={() => { setMode("bot"); setSelectedRequest(null); setLiveMessages([]); }}
                    className="hover:bg-white/20 p-1 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  {mode === "bot" ? <Bot className="w-5 h-5" /> : 
                   mode === "live_chat" ? <Stethoscope className="w-4 h-4" /> :
                   mode === "history" ? <History className="w-4 h-4" /> :
                   <MessageSquare className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{headerTitle()}</h3>
                  <p className="text-[10px] text-white/80">{headerSubtitle()}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── MODE: FAQ BOT (REQ178, REQ179, REQ180) ── */}
            {mode === "bot" && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50 dark:bg-neutral-950 custom-scrollbar">
                  {botMessages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.type === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn("flex gap-2 max-w-[88%]", msg.type === "user" ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn("w-7 h-7 rounded-full flex shrink-0 items-center justify-center text-xs",
                          msg.type === "user" 
                            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600" 
                            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                        )}>
                          {msg.type === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>
                        <div className={cn("p-3 rounded-2xl text-[13px] leading-relaxed",
                          msg.type === "user" 
                            ? "bg-primary-500 text-white rounded-tr-sm" 
                            : "bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-tl-sm text-neutral-700 dark:text-neutral-300 shadow-sm"
                        )}>
                          <p className="whitespace-pre-line">{msg.text}</p>
                          {msg.isWidget && msg.widgetOptions && (
                            <div className="mt-3 flex flex-col gap-1.5">
                              {msg.widgetOptions.map((opt, i) => (
                                <button key={i} onClick={opt.action} className="text-xs font-semibold px-3 py-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg text-left transition-colors flex items-center justify-between">
                                  {opt.label} <ChevronRight className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={endOfMessagesRef} />
                </div>
                <form onSubmit={handleBotSubmit} className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex gap-2 shrink-0">
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ask a question..." className="flex-1 input rounded-full text-sm h-10" />
                  <button type="submit" disabled={!inputValue.trim()} className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}

            {/* ── MODE: SELECT VET (REQ181) ── */}
            {mode === "vets_list" && (
              <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-950 custom-scrollbar">
                <p className="text-xs text-neutral-500 mb-4 text-center">Select a doctor to request a direct chat</p>
                <div className="space-y-2">
                  {vets.map(vet => (
                    <button 
                      key={vet.id}
                      onClick={() => sendChatRequest(vet.id)}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all shadow-sm group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-bold text-sm truncate">Dr. {vet.name || `${vet.firstName || ''} ${vet.lastName || ''}`}</p>
                        <p className="text-[10px] text-neutral-500">{vet.role?.name || vet.role || "Veterinarian"}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors shrink-0" />
                    </button>
                  ))}
                  {vets.length === 0 && (
                    <div className="text-center text-xs text-neutral-400 py-10">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                      Loading available doctors...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── MODE: REQUEST STATUS (REQ182) ── */}
            {mode === "request_status" && selectedRequest && (
              <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center text-center">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mb-4",
                  selectedRequest.status === "Pending" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-500" :
                  selectedRequest.status === "Approved" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500" :
                  "bg-red-100 dark:bg-red-900/20 text-red-500"
                )}>
                  {selectedRequest.status === "Pending" ? <Clock className="w-10 h-10" /> :
                   selectedRequest.status === "Approved" ? <CheckCircle2 className="w-10 h-10" /> :
                   <XCircle className="w-10 h-10" />}
                </div>
                <h3 className="text-lg font-bold mb-1">
                  {selectedRequest.status === "Pending" ? "Request Pending" :
                   selectedRequest.status === "Approved" ? "Request Approved!" :
                   "Request Declined"}
                </h3>
                <p className="text-sm text-neutral-500 mb-2">
                  Chat with Dr. {selectedRequest.vetUser?.lastName || "Vet"}
                </p>
                <StatusBadge status={selectedRequest.status} />
                
                {selectedRequest.status === "Pending" && (
                  <p className="text-xs text-neutral-400 mt-4 max-w-[260px]">
                    Your chat request has been sent. The doctor will review and accept or decline it. Please check back shortly.
                  </p>
                )}
                {selectedRequest.status === "Approved" && (
                  <button 
                    onClick={() => setMode("live_chat")}
                    className="btn btn-primary mt-4 text-sm"
                  >
                    Open Conversation →
                  </button>
                )}
                {selectedRequest.status === "Declined" && (
                  <p className="text-xs text-neutral-400 mt-4 max-w-[260px]">
                    The doctor was unable to accept your chat request at this time. You can try contacting another doctor or call the clinic directly.
                  </p>
                )}
                <button 
                  onClick={() => { fetchMyRequests(); /* refresh status */ 
                    if (selectedRequest.status === "Pending") {
                      // Re-fetch to check for status update
                      fetch(`${API_BASE()}/api/chat-requests/my-requests`, {
                        headers: { "Authorization": `Bearer ${getToken()}` }
                      }).then(r => r.json()).then((reqs: ChatRequestType[]) => {
                        const updated = reqs.find(r => r.id === selectedRequest.id);
                        if (updated) {
                          setSelectedRequest(updated);
                          if (updated.status === "Approved") setMode("live_chat");
                        }
                      });
                    }
                  }}
                  className="mt-4 text-xs text-primary-500 hover:text-primary-600 underline"
                >
                  Refresh Status
                </button>
              </div>
            )}

            {/* ── MODE: LIVE CHAT (REQ183) ── */}
            {mode === "live_chat" && selectedRequest && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50 dark:bg-neutral-950 custom-scrollbar">
                  {liveMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-4 space-y-2">
                      <Stethoscope className="w-10 h-10 opacity-30" />
                      <p className="text-xs text-center">You're connected with Dr. {selectedRequest.vetUser?.lastName}. Send a message to start!</p>
                    </div>
                  ) : (
                    liveMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id;
                      return (
                        <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                          <div className={cn(
                            "px-3 py-2 rounded-2xl text-[13px] max-w-[80%] whitespace-pre-wrap shadow-sm",
                            isMe 
                              ? "bg-primary-500 text-white rounded-br-sm" 
                              : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-bl-sm"
                          )}>
                            {!isMe && (
                              <p className="text-[10px] font-bold text-primary-500 mb-0.5">
                                Dr. {msg.sender?.lastName}
                              </p>
                            )}
                            {msg.body}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-[9px] text-neutral-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && msg.isRead && <CheckCircle2 className="w-3 h-3 text-primary-500" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={endOfMessagesRef} />
                </div>
                <form onSubmit={handleLiveSend} className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex gap-2 shrink-0">
                  <input type="text" value={liveInput} onChange={(e) => setLiveInput(e.target.value)} placeholder="Type a message..." className="flex-1 input rounded-full text-sm h-10" />
                  <button type="submit" disabled={!liveInput.trim() || sending} className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}

            {/* ── MODE: CHAT HISTORY (REQ184) ── */}
            {mode === "history" && (
              <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-950 custom-scrollbar">
                <p className="text-xs text-neutral-500 mb-4 text-center">Your chat requests and conversations</p>
                <div className="space-y-2">
                  {myRequests.map(req => (
                    <button 
                      key={req.id}
                      onClick={() => openRequest(req)}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all shadow-sm"
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        req.status === "Approved" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" :
                        req.status === "Pending" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" :
                        "bg-red-100 dark:bg-red-900/20 text-red-600"
                      )}>
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-bold text-sm truncate">Dr. {req.vetUser.firstName} {req.vetUser.lastName}</p>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={req.status} />
                          <span className="text-[10px] text-neutral-400">{req._count.messages} msgs</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
                    </button>
                  ))}
                  {myRequests.length === 0 && (
                    <div className="text-center text-xs text-neutral-400 py-10">
                      No chat requests yet. Use "Chat with a Doctor" to get started!
                    </div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
