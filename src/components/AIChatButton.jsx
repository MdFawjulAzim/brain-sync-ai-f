import { useState, useRef, useEffect } from "react";
import { Button, Input, Modal, Avatar } from "antd";
import { MessageCircle, Send, Bot, User, Sparkles, X, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { useChatWithNotesMutation } from "../store/services/noteApi";
import ReactMarkdown from "react-markdown";

const AIChatButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([
        { role: "ai", text: "Hi there! 👋 I've read all your notes. Ask me anything to find connections or summaries!" }
    ]);

    const [askAI, { isLoading }] = useChatWithNotesMutation();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isExpanded]);

    const handleSend = async () => {
        if (!question.trim()) return;

        const userMsg = { role: "user", text: question };
        setMessages((prev) => [...prev, userMsg]);
        setQuestion("");

        try {
            const res = await askAI({ question: userMsg.text }).unwrap();
            const aiMsg = {
                role: "ai",
                text: res.answer || "I couldn't find anything relevant in your notes."
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
            console.error("AI Chat Error:", err);
            setMessages((prev) => [...prev, { role: "ai", text: "⚠️ Oops! My brain creates a connection error. Try again!" }]);
        }
    };

    return (
        <>
            <div className="fixed bottom-8 right-8 z-50 group">
                <div className={`absolute inset-0 rounded-full blur-lg opacity-40 bg-purple-600 transition-all duration-500 ${isOpen ? 'animate-none' : 'animate-pulse'}`}></div>

                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={isOpen ? <X size={28} className="text-white" /> : <MessageCircle size={28} className="text-white" />}
                    className={`relative h-16 w-16 shadow-2xl border-none flex items-center justify-center transition-all duration-500 transform ${isOpen
                        ? "bg-red-500 rotate-90 hover:bg-red-600"
                        : "bg-linear-to-r from-blue-600 to-purple-600 hover:scale-110 hover:-translate-y-1"
                        }`}
                    onClick={() => setIsOpen(!isOpen)}
                />
            </div>

            <Modal
                title={null}
                open={isOpen}
                onCancel={() => setIsOpen(false)}
                footer={null}
                mask={false}
                closeIcon={null}
                style={{
                    position: 'fixed',
                    bottom: '90px',
                    right: '32px',
                    margin: 0,
                    padding: 0,
                    top: 'auto',
                    transition: 'all 0.3s ease-in-out'
                }}
                width={isExpanded ? 600 : 380}
                className="custom-chat-modal"
                styles={{
                    content: {
                        padding: 0,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(229, 231, 235, 1)'
                    },
                    body: {
                        padding: 0,
                        margin: 0
                    }
                }}
            >
                <div className={`flex flex-col bg-white transition-all duration-300 ${isExpanded ? 'h-150' : 'h-125'}`}>

                    {/* 1. Stylish Header */}
                    <div className="bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                <Sparkles size={20} className="text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight m-0 text-white">BrainSync AI</h3>
                                <p className="text-xs text-blue-100 m-0 opacity-90">Connected to your notes</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Expand/Collapse Button */}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1.5 hover:bg-white/20 rounded-full transition text-white/90"
                            >
                                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition text-white/90">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* 2. Messages Area (with Custom Scrollbar) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                            >
                                {/* Avatar */}
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${msg.role === "user" ? "bg-blue-100" : "bg-linear-to-br from-purple-100 to-white border border-purple-200"
                                    }`}>
                                    {msg.role === "user" ? <User size={16} className="text-blue-600" /> : <Bot size={18} className="text-purple-600" />}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`p-3.5 px-4 text-sm shadow-sm transition-all duration-200 hover:shadow-md ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                                        : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
                                        }`}
                                >
                                    {msg.role === "ai" ? (
                                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 text-gray-700">
                                            <ReactMarkdown
                                                components={{
                                                    ul: ({ ...props }) => <ul className="list-disc ml-4 space-y-1" {...props} />,
                                                    ol: ({ ...props }) => <ol className="list-decimal ml-4 space-y-1" {...props} />,
                                                    a: ({ ...props }) => <a className="text-blue-500 underline" {...props} />,
                                                    strong: ({ ...props }) => <strong className="font-bold text-purple-700" {...props} />,
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex items-center gap-2 ml-1">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                                    <Bot size={18} className="text-purple-400" />
                                </div>
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                                    <Loader2 className="animate-spin text-purple-600" size={16} />
                                    <span className="text-xs text-gray-500 font-medium">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 3. Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                            <Input
                                placeholder="Ask about your notes..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onPressEnter={handleSend}
                                disabled={isLoading}
                                bordered={false}
                                className="bg-transparent pl-4 text-gray-700 placeholder:text-gray-400 focus:shadow-none"
                            />
                            <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} className="-ml-0.5 mt-0.5" />}
                                onClick={handleSend}
                                disabled={!question.trim() || isLoading}
                                className={`${question.trim() && !isLoading
                                    ? "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
                                    : "bg-gray-300"
                                    } border-none transition-all duration-300 transform hover:scale-105 active:scale-95`}
                            />
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                <Sparkles size={10} /> Powered by Gemini AI
                            </span>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AIChatButton;