"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Search, User, Send, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VetMessagesPage() {
  const [inbox, setInbox] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("vcms_user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    fetchInbox();
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchInbox = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const res = await fetch(`${baseUrl}/api/messages/inbox`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setInbox(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: number) => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const res = await fetch(`${baseUrl}/api/messages/conversation/${otherUserId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChat) return;

    setSending(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const res = await fetch(`${baseUrl}/api/messages`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          receiverId: activeChat.id,
          body: replyText
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages([...messages, newMsg]);
        setReplyText("");
        fetchInbox(); // refresh latest message in sidebar
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-neutral-500">Loading inbox...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 pb-6">
      
      {/* Sidebar: Inbox */}
      <div className="w-1/3 min-w-[300px] flex flex-col card overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-500" /> Direct Messages
          </h2>
          <div className="relative mt-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="text" placeholder="Search conversations..." className="input pl-9 w-full bg-neutral-50 dark:bg-neutral-900 border-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {inbox.length === 0 ? (
            <div className="p-10 text-center text-neutral-500 text-sm">
              No conversations found.
            </div>
          ) : (
            inbox.map((conv: any) => (
              <button
                key={conv.contact.id}
                onClick={() => setActiveChat(conv.contact)}
                className={cn(
                  "w-full text-left p-3 rounded-xl flex gap-3 transition-colors",
                  activeChat?.id === conv.contact.id 
                    ? "bg-primary-50 dark:bg-primary-500/10" 
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                )}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-neutral-500" />
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-neutral-900">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={cn("text-sm font-bold truncate", activeChat?.id === conv.contact.id ? "text-primary-600 dark:text-primary-400" : "")}>
                      {conv.contact.firstName} {conv.contact.lastName}
                    </h3>
                    <span className="text-[10px] text-neutral-400 whitespace-nowrap ml-2">
                      {new Date(conv.latestMessage.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={cn("text-xs truncate", conv.unreadCount > 0 ? "font-bold text-neutral-900 dark:text-white" : "text-neutral-500")}>
                    {conv.latestMessage.senderId === currentUser?.id ? "You: " : ""}{conv.latestMessage.body}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col card overflow-hidden">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white/50 dark:bg-neutral-900/50 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-none mb-1">{activeChat.firstName} {activeChat.lastName}</h3>
                  <span className="badge badge-success text-[10px]">Client</span>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/20 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
                  Start of conversation with {activeChat.firstName}.
                </div>
              ) : (
                messages.map((msg: any) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={cn("flex flex-col max-w-[75%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
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

            {/* Message Input */}
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
                  <Send className="w-5 h-5 -ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-semibold text-lg text-neutral-600 dark:text-neutral-300">Your Inbox</p>
            <p className="text-sm">Select a conversation from the sidebar to start messaging.</p>
          </div>
        )}
      </div>

    </div>
  );
}
