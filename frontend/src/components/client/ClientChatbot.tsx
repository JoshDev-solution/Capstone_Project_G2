"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Clock, MapPin, Calendar, HelpCircle, ChevronRight, Stethoscope, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  type: "user" | "bot" | "vet";
  text: string;
  isWidget?: boolean;
  widgetOptions?: { label: string; action: () => void }[];
  isRead?: boolean;
  createdAt?: string;
};

export default function ClientChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"bot" | "vets_list" | "live_chat">("bot");
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Bot State
  const [botMessages, setBotMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "Hello! I'm LJ Vet Clinic's automated assistant. How can I help you today?",
      isWidget: true,
      widgetOptions: [
        { label: "Clinic Hours", action: () => handleBotAction("Clinic Hours") },
        { label: "Location", action: () => handleBotAction("Location") },
        { label: "Book Appointment", action: () => handleBotAction("Book Appointment") },
        { label: "Chat with a Doctor", action: () => handleBotAction("Chat with a Doctor") }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Live Chat State
  const [vets, setVets] = useState<any[]>([]);
  const [selectedVet, setSelectedVet] = useState<any>(null);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [liveInput, setLiveInput] = useState("");
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("vcms_user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [botMessages, liveMessages, isOpen, mode]);

  // --- BOT LOGIC ---
  const addBotMessage = (msg: Omit<Message, "id">) => {
    setBotMessages(prev => [...prev, { ...msg, id: Date.now().toString() }]);
  };

  const handleBotAction = (action: string) => {
    addBotMessage({ type: "user", text: action });
    
    if (action === "Chat with a Doctor") {
      setTimeout(() => {
        setMode("vets_list");
        fetchVets();
      }, 500);
      return;
    }
    
    setTimeout(() => {
      if (action === "Clinic Hours") {
        addBotMessage({ type: "bot", text: "We are open Monday to Friday from 8:00 AM to 6:00 PM, and Saturday from 9:00 AM to 4:00 PM. We are closed on Sundays." });
      } else if (action === "Location") {
        addBotMessage({ type: "bot", text: "We are located at 123 Pet Friendly Ave, San Jose City. You can find us near the central park." });
      } else if (action === "Book Appointment") {
        addBotMessage({ type: "bot", text: "You can book an appointment easily! Just click on 'Appointments' in your sidebar, select your pet, choose a time, and confirm." });
      } else {
        addBotMessage({ type: "bot", text: "Please type your question, and if I can't answer it, you can chat with a doctor directly!" });
      }
    }, 600);
  };

  const handleBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    addBotMessage({ type: "user", text: userText });
    setInputValue("");

    setTimeout(() => {
      const lower = userText.toLowerCase();
      if (lower.includes("hour") || lower.includes("time") || lower.includes("open")) {
        handleBotAction("Clinic Hours");
      } else if (lower.includes("where") || lower.includes("location") || lower.includes("address")) {
        handleBotAction("Location");
      } else if (lower.includes("book") || lower.includes("schedule") || lower.includes("appointment")) {
        handleBotAction("Book Appointment");
      } else if (lower.includes("vet") || lower.includes("doctor") || lower.includes("chat") || lower.includes("talk")) {
        handleBotAction("Chat with a Doctor");
      } else {
        addBotMessage({ type: "bot", text: "Thank you for your message! Since I'm just an automated FAQ bot, I might not understand everything. You can click 'Chat with a Doctor' below to speak to a real vet.", isWidget: true, widgetOptions: [{ label: "Chat with a Doctor", action: () => handleBotAction("Chat with a Doctor") }] });
      }
    }, 600);
  };

  // --- LIVE CHAT LOGIC ---
  const fetchVets = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const res = await fetch(`${baseUrl}/api/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const users = await res.json();
        // Filter for role Veterinarian
        const vetsOnly = users.filter((u: any) => u.role?.name === "Veterinarian" || u.role?.name === "Admin");
        setVets(vetsOnly);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startLiveChat = (vet: any) => {
    setSelectedVet(vet);
    setMode("live_chat");
    setPolling(true);
    fetchLiveMessages(vet.id);
  };

  const fetchLiveMessages = async (vetId: number) => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const res = await fetch(`${baseUrl}/api/messages/conversation/${vetId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((m: any) => ({
          id: m.id.toString(),
          type: m.senderId === currentUser?.id ? "user" : "vet",
          text: m.body,
          isRead: m.isRead,
          createdAt: m.createdAt
        }));
        setLiveMessages(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simple polling for live messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && mode === "live_chat" && selectedVet && polling) {
      interval = setInterval(() => {
        fetchLiveMessages(selectedVet.id);
      }, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isOpen, mode, selectedVet, polling]);

  const handleLiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveInput.trim() || !selectedVet) return;

    const textToSend = liveInput;
    setLiveInput("");
    
    // Optimistic update
    setLiveMessages(prev => [...prev, { id: Date.now().toString(), type: "user", text: textToSend }]);

    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      await fetch(`${baseUrl}/api/messages`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          receiverId: selectedVet.id,
          body: textToSend
        })
      });
      
      // Refresh messages
      fetchLiveMessages(selectedVet.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-lg shadow-primary-500/30 flex items-center justify-center text-white z-40 transition-transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
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
            className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="gradient-primary p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                {mode !== "bot" && (
                  <button onClick={() => { setMode("bot"); setPolling(false); }} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  {mode === "bot" ? <Bot className="w-5 h-5" /> : <Stethoscope className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {mode === "bot" ? "Clinic Assistant" : 
                     mode === "vets_list" ? "Select Doctor" : 
                     `Dr. ${selectedVet?.lastName || "Vet"}`}
                  </h3>
                  <p className="text-[10px] text-white/80">
                    {mode === "bot" ? "FAQ Bot" : 
                     mode === "vets_list" ? "Direct Messaging" : 
                     "Live Chat"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setIsOpen(false); setPolling(false); }}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            {mode === "bot" && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-950 custom-scrollbar">
                  {botMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`flex gap-2 max-w-[85%] ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center ${msg.type === "user" ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"}`}>
                          {msg.type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${msg.type === "user" ? "bg-primary-500 text-white rounded-tr-sm" : "bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-tl-sm text-neutral-700 dark:text-neutral-300 shadow-sm"}`}>
                          <p>{msg.text}</p>
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
                <form onSubmit={handleBotSubmit} className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a question..." className="flex-1 input rounded-full text-sm h-10" />
                  <button type="submit" disabled={!inputValue.trim()} className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Send className="w-4 h-4 ml-1" />
                  </button>
                </form>
              </>
            )}

            {mode === "vets_list" && (
              <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-950 custom-scrollbar">
                <p className="text-sm font-semibold text-neutral-500 mb-4 text-center">Available Doctors</p>
                <div className="space-y-2">
                  {vets.map(vet => (
                    <button 
                      key={vet.id}
                      onClick={() => startLiveChat(vet)}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-primary-300 transition-all shadow-sm group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-sm">Dr. {vet.firstName} {vet.lastName}</p>
                        <p className="text-[10px] text-neutral-500">{vet.role?.name || "Veterinarian"}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors" />
                    </button>
                  ))}
                  {vets.length === 0 && (
                    <div className="text-center text-xs text-neutral-400 py-10">No doctors currently available.</div>
                  )}
                </div>
              </div>
            )}

            {mode === "live_chat" && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-950 custom-scrollbar">
                  {liveMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 p-4 space-y-2">
                      <Stethoscope className="w-8 h-8 opacity-50" />
                      <p className="text-xs">You are now connected to Dr. {selectedVet?.lastName}. Send a message to start chatting.</p>
                    </div>
                  ) : (
                    liveMessages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}>
                        <div className={cn(
                          "px-3 py-2 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap shadow-sm",
                          msg.type === "user" ? "bg-primary-500 text-white rounded-br-sm" : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-bl-sm"
                        )}>
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-neutral-400">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                          {msg.type === "user" && msg.isRead && <CheckCircle2 className="w-3 h-3 text-primary-500" />}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={endOfMessagesRef} />
                </div>
                <form onSubmit={handleLiveSubmit} className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
                  <input type="text" value={liveInput} onChange={(e) => setLiveInput(e.target.value)} placeholder="Message Doctor..." className="flex-1 input rounded-full text-sm h-10" />
                  <button type="submit" disabled={!liveInput.trim()} className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Send className="w-4 h-4 ml-1" />
                  </button>
                </form>
              </>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
