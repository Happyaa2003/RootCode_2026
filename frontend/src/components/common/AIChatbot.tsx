import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { api } from '../../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
}

const GREETING: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    '👋 **Hi! I\'m the WayPilot AI Assistant.**\n\n' +
    'I can help you with real-time operations data. Try asking:\n\n' +
    '• _"How many orders are at risk?"_\n' +
    '• _"Show me driver performance"_\n' +
    '• _"What\'s the fleet status?"_\n' +
    '• _"Show fuel consumption"_\n' +
    '• _"Give me a KPI summary"_',
  timestamp: new Date(),
  intent: 'greeting',
};

const QUICK_PROMPTS = [
  '📦 Order summary',
  '⚠️ At risk orders',
  '🚛 Fleet status',
  '👤 Driver performance',
  '⛽ Fuel usage',
  '💰 Delivery costs',
  '📊 KPI dashboard',
  '⏱️ Delayed orders',
];

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pulseVisible, setPulseVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setPulseVisible(false);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.askAssistant(text.trim(), history);

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
        intent: response.intent,
      };

      // Simulate typing delay for realism
      await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Fallback when backend is unreachable
      const fallback: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: '⚡ I\'m having trouble connecting to the operations server. Please make sure the backend is running on `localhost:8000`.',
        timestamp: new Date(),
        intent: 'error',
      };
      setMessages(prev => [...prev, fallback]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    // Strip emoji prefix
    const text = prompt.replace(/^[^\w]*/, '').trim();
    sendMessage(text);
  };

  // Format markdown-like content to HTML
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:var(--bg-muted);padding:1px 5px;border-radius:3px;font-size:11px;font-family:var(--font-mono)">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="ai-chatbot-fab"
          title="Ask WayPilot AI"
        >
          <div className="ai-chatbot-fab-inner">
            <Sparkles size={22} />
          </div>
          {pulseVisible && <div className="ai-chatbot-pulse" />}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`ai-chatbot-window ${isExpanded ? 'expanded' : ''}`}>
          {/* Header */}
          <div className="ai-chatbot-header">
            <div className="ai-chatbot-header-left">
              <div className="ai-chatbot-avatar">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="ai-chatbot-title">WayPilot AI</div>
                <div className="ai-chatbot-subtitle">
                  <span className="ai-chatbot-online-dot" />
                  Operations Assistant
                </div>
              </div>
            </div>
            <div className="ai-chatbot-header-actions">
              <button
                onClick={() => setIsExpanded(e => !e)}
                className="ai-chatbot-header-btn"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="ai-chatbot-header-btn"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`ai-chatbot-msg ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="ai-chatbot-msg-avatar">
                    <Sparkles size={12} />
                  </div>
                )}
                <div className={`ai-chatbot-msg-bubble ${msg.role}`}>
                  <div
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                    style={{ lineHeight: 1.55 }}
                  />
                  <div className="ai-chatbot-msg-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="ai-chatbot-msg assistant">
                <div className="ai-chatbot-msg-avatar">
                  <Sparkles size={12} />
                </div>
                <div className="ai-chatbot-msg-bubble assistant">
                  <div className="ai-chatbot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts (shown when few messages) */}
          {messages.length <= 2 && (
            <div className="ai-chatbot-quick-prompts">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="ai-chatbot-quick-btn"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ai-chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about orders, fleet, routes..."
              className="ai-chatbot-input"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="ai-chatbot-send-btn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
