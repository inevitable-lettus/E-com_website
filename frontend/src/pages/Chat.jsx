import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { Send, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Chat() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    api.get("/chats").then((r) => {
      setChats(r.data);
      if (chatId) {
        const found = r.data.find((c) => c.id === chatId);
        if (found) openChat(found);
      }
    });
  }, [chatId]);

  useEffect(() => {
    if (!socket || !activeChat) return;
    socket.emit("join_chat", activeChat.id);

    socket.on("new_message", (msg) => {
      if (msg.chat_id === activeChat.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    socket.on("user_typing", ({ userId }) => {
      if (userId !== user?.id) setPeerTyping(true);
    });
    socket.on("user_stop_typing", ({ userId }) => {
      if (userId !== user?.id) setPeerTyping(false);
    });

    return () => {
      socket.emit("leave_chat", activeChat.id);
      socket.off("new_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [socket, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openChat = async (chat) => {
    setActiveChat(chat);
    navigate(`/chat/${chat.id}`, { replace: true });
    const r = await api.get(`/chats/${chat.id}/messages`);
    setMessages(r.data);
  };

  const sendMessage = async () => {
    if (!text.trim() || !activeChat) return;
    const content = text.trim();
    setText("");

    try {
      const r = await api.post(`/chats/${activeChat.id}/messages?content=${encodeURIComponent(content)}`);
      socket?.emit("send_message", {
        chatId: activeChat.id,
        message: { ...r.data, sender: { id: user?.id, name: user?.name } },
      });
      setMessages((prev) => [...prev, r.data]);
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleTyping = () => {
    if (!socket || !activeChat) return;
    if (!typing) { socket.emit("typing", activeChat.id); setTyping(true); }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", activeChat.id);
      setTyping(false);
    }, 1500);
  };

  const peer = activeChat
    ? activeChat.owner_id === user?.id ? activeChat.renter : activeChat.owner
    : null;

  return (
    <div className="max-w-5xl mx-auto px-0 sm:px-4 py-0 sm:py-6 h-[calc(100vh-4rem)]">
      <div className="card h-full flex overflow-hidden rounded-none sm:rounded-xl">
        {/* Sidebar */}
        <div className={`${activeChat ? "hidden sm:flex" : "flex"} w-full sm:w-72 flex-col border-r border-gray-100`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Messages</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {chats.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle size={36} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-400">No conversations yet.</p>
                <Link to="/browse" className="text-xs text-primary-600 hover:underline mt-1 block">Browse items to start chatting</Link>
              </div>
            ) : chats.map((c) => {
              const other = c.owner_id === user?.id ? c.renter : c.owner;
              return (
                <button key={c.id} onClick={() => openChat(c)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 border-b border-gray-50 transition-colors ${activeChat?.id === c.id ? "bg-primary-50 border-l-2 border-l-primary-600" : ""}`}>
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold shrink-0">
                    {other?.name?.[0] || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{other?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.last_message || "No messages yet"}</p>
                  </div>
                  {c.unread_count > 0 && (
                    <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center shrink-0">
                      {c.unread_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className={`${!activeChat ? "hidden sm:flex" : "flex"} flex-1 flex-col`}>
          {!activeChat ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-3 text-gray-200" />
                <p>Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => { setActiveChat(null); navigate("/chat"); }}
                  className="sm:hidden text-gray-500 hover:text-gray-700 mr-1">←</button>
                <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                  {peer?.name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{peer?.name}</p>
                  {peerTyping && <p className="text-xs text-gray-400">typing…</p>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 ${isMe ? "bg-primary-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                        <p className="text-sm leading-relaxed">{m.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-primary-200" : "text-gray-400"}`}>
                          {format(new Date(m.created_at), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => { setText(e.target.value); handleTyping(); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message…"
                    className="input flex-1"
                  />
                  <button onClick={sendMessage} disabled={!text.trim()}
                    className="btn-primary px-3 disabled:opacity-40">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
