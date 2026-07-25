import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, RefreshCw, Zap, Copy, Check } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  providerName?: string;
}

interface ChatCopilotProps {
  reportId: string;
  reportTitle: string;
}

const QUICK_PROMPTS = [
  'How do I fix my primary CTA contrast?',
  'Write 3 high-converting subheadlines for B2B Founders',
  'Generate a high-contrast Tailwind CSS button code snippet',
  'How can I fix my WCAG accessibility issues?',
];

export const ChatCopilot: React.FC<ChatCopilotProps> = ({ reportId, reportTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hi! I'm your **LandingIQ Interactive CRO Copilot**. I have fully analyzed your audit report for **"${reportTitle}"**. \n\nAsk me anything! I can generate custom copy rewrites, provide exact Tailwind CSS button code, or explain how to fix your score.`,
      providerName: 'AI Copilot',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: query,
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Filter payload for API
      const payloadMessages = updatedMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/chat-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          messages: payloadMessages.length > 0 ? payloadMessages : [{ role: 'user', content: query }],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message to Copilot');
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'I processed your request, but received an empty response.',
        providerName: data.providerName || 'AI Engine',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Copilot Notice**: ${err?.message || 'Something went wrong while connecting to the AI engine. Please try asking again.'}`,
        providerName: 'error',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getProviderBadge = (name?: string) => {
    if (!name || name === 'error') return null;
    const formatted = name.charAt(0).toUpperCase() + name.slice(1);
    return (
      <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/30">
        <Zap className="w-2.5 h-2.5 fill-current" />
        <span>Powered by {formatted}</span>
      </span>
    );
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-navy-900 hover:bg-navy-800 text-amber rounded-full shadow-2xl border-2 border-amber/60 flex items-center space-x-3 group transition-all transform hover:scale-105"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-amber" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-navy-900 animate-pulse" />
          </div>
          <span className="font-bold text-sm font-display text-white pr-1">CRO Chat Copilot</span>
          <span className="bg-amber/20 text-amber text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-amber/40">
            Live AI
          </span>
        </button>
      )}

      {/* Expanded Interactive Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[600px] bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-navy-950 border-b border-navy-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-amber/10 border border-amber/30 text-amber">
                <Sparkles className="w-5 h-5 text-amber" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold font-display text-white">CRO Chat Copilot</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Context Active
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate max-w-[220px]">Report: {reportTitle}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-navy-900/90 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-amber/20 border border-amber/40 text-amber flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed relative group ${
                    msg.role === 'user'
                      ? 'bg-amber text-navy-950 font-medium rounded-tr-none shadow-md'
                      : 'bg-navy-800 text-gray-100 border border-navy-700 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-navy-700/60">
                      {getProviderBadge(msg.providerName)}
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="text-gray-400 hover:text-amber text-xs flex items-center gap-1 transition-colors ml-auto"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                    {msg.content}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-navy-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-gray-400 text-xs pl-2 animate-pulse">
                <Bot className="w-4 h-4 text-amber animate-spin" />
                <span>Copilot is analyzing report context & generating response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-2 bg-navy-950/80 border-t border-navy-800 overflow-x-auto flex items-center space-x-2 no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">Quick Prompts:</span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSend(prompt)}
                className="shrink-0 px-2.5 py-1 bg-navy-800 hover:bg-amber/20 hover:text-amber text-gray-300 text-xs rounded-full border border-navy-700 transition-colors whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-navy-950 border-t border-navy-800 flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot a question about your report..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 bg-navy-900 border border-navy-700 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-amber hover:bg-amber-hover disabled:opacity-40 text-navy-950 rounded-xl font-bold transition-all shadow-md shrink-0"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
