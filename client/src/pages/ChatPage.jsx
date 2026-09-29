import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  User,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Namaste! I am NIRIKSHAN AI, your data-grounded MPLADS surveillance and audit copilot.\n\nI can analyze risk factors, verify MoSPI statutory guidelines, locate contractor monopolization patterns, and answer questions grounded strictly in validated portal records.',
      data: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chat(query);
      const botMsg = {
        sender: 'assistant',
        text: res.answer || 'Query completed.',
        data: res.data || null,
        intent: res.intent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Apologies, I encountered an issue retrieving data: ${err.message || 'Server error'}. Please verify server connection.`,
          data: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Show high-risk works in Karnataka',
    'Which vendors appear in flagged works?',
    'Find potential duplicate or overlapping works',
    'Total expenditure and implementation summary',
    'Show ongoing works with long duration',
    'Audit works for MP Pralhad Venkatesh Joshi',
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BotMessageSquare size={24} style={{ color: 'var(--accent)' }} />
            NIRIKSHAN Copilot · Grounded MPLADS Assistant
          </h1>
          <p className="page-subtitle">
            Query allocations, investigate anomaly flags, and inspect statutory compliance with data citations
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() =>
            setMessages([
              {
                sender: 'assistant',
                text: 'Chat history cleared. How can I assist your MPLADS audit today?',
                data: null,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
        >
          <RotateCcw size={14} /> Clear History
        </button>
      </div>

      {/* Suggested prompts strip */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleSendMessage(prompt)}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            <Sparkles size={12} style={{ color: 'var(--accent)' }} />
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={index}
                className={`chat-msg ${isUser ? 'user' : 'assistant'}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>
                    {isUser ? 'MoSPI Auditor' : 'NIRIKSHAN Intelligence'}
                  </span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.65 }}>{msg.timestamp}</span>
                </div>

                <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{msg.text}</div>

                {/* Grounded Works References / Direct Link Cards */}
                {msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                  <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>
                      CITED WORK DOSSIERS ({msg.data.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {msg.data.slice(0, 5).map((w, idx) => (
                        <div
                          key={idx}
                          className="clickable"
                          onClick={() => navigate(`/works/${w.internal_work_key}`)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 'var(--radius)',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div className="font-mono text-xs font-bold" style={{ color: 'var(--accent)' }}>
                              {w.internal_work_key}
                            </div>
                            <div className="text-xs truncate" style={{ maxWidth: 360 }}>
                              {w.description}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {w.risk_level && <RiskBadge level={w.risk_level} score={w.risk_score} showIcon={false} />}
                            <ArrowRight size={13} style={{ color: 'var(--muted)' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="chat-msg thinking">
              <span>NIRIKSHAN is cross-referencing audit rules & guidelines...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          className="chat-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <textarea
            className="chat-input"
            rows={1}
            placeholder="Ask questions about works, risk anomalies, vendors, MPs, or state utilization..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={!input.trim() || loading}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
