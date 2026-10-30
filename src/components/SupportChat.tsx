import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User } from 'lucide-react';
import { useAudioController } from '../context/AudioControllerContext.tsx';
import toddPortrait from '../assets/images/support_person_todd_1793320672649.jpg';

interface Message {
  id: string;
  sender: 'todd' | 'user';
  text: string;
  time: string;
}

interface SupportChatProps {
  canStart?: boolean;
  externalTriggerPrompt?: string | null;
  onClearExternalTrigger?: () => void;
}

export const SupportChat: React.FC<SupportChatProps> = ({
  canStart = false,
  externalTriggerPrompt,
  onClearExternalTrigger,
}) => {
  const { playChatReceive, playChatSend, resumeAudioContext } = useAudioController();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scripted opening messages from Todd
  const scriptedMessages = [
    "Hi, I'm Todd from Customer Delight!",
    "Thanks for visiting our site today!",
    "If I can help with anything, just let me know :)",
    "Did you know our premium subscribers read articles 30% faster?",
    "I noticed you're still reading! Would you like to schedule a 45-minute synchronization call?",
  ];

  // Auto-scroll inside chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // First greeting arrives ONLY after canStart is true (barrage closed AND user scrolled)
  useEffect(() => {
    if (!canStart) return;

    if (messages.length === 0) {
      const timer = setTimeout(() => {
        deliverToddMessage(scriptedMessages[0]);
        setStepIndex(1);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [canStart, messages.length]);

  // Handle external on-page button trigger ("Todd asks: hey did you need something?")
  useEffect(() => {
    if (externalTriggerPrompt) {
      deliverToddMessage(externalTriggerPrompt);
      if (onClearExternalTrigger) {
        onClearExternalTrigger();
      }
    }
  }, [externalTriggerPrompt, onClearExternalTrigger]);

  // Sequence remaining scripted messages with natural delays
  useEffect(() => {
    if (!canStart) return;

    if (stepIndex > 0 && stepIndex < scriptedMessages.length) {
      const delay = stepIndex === 1 ? 6500 : stepIndex === 2 ? 9000 : 16000;
      const timer = setTimeout(() => {
        deliverToddMessage(scriptedMessages[stepIndex]);
        setStepIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [stepIndex, canStart]);

  const deliverToddMessage = (text: string) => {
    // Chat receive sound effect
    playChatReceive();
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'todd',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    // ONLY opens when there is a new message!
    setIsOpen(true);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    resumeAudioContext();
    // Chat send sound effect
    playChatSend();

    const userText = inputText.trim();
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'user',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputText('');

    // Todd's helpful reply
    setTimeout(() => {
      const cannedReplies = [
        "That's a fantastic inquiry! Our senior retention consultants are analyzing your intent as we speak.",
        "Understood! Please don't navigate away, an account representative will confirm your device telemetry shortly.",
        "I'm always right here in your viewport if you need further paradigm optimizations!",
        "Great question! Have you considered accepting all third-party tracking partners to unlock maximum clarity?",
      ];
      const reply = cannedReplies[Math.floor(Math.random() * cannedReplies.length)];
      deliverToddMessage(reply);
    }, 1200);
  };

  return (
    <div className="fixed bottom-18 right-5 z-40 font-sans">
      {/* Floating Chat Window */}
      {isOpen ? (
        <div className="w-80 sm:w-92 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col text-neutral-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header with Todd's face */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={toddPortrait}
                  alt="Todd Customer Delight"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/80"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-wide leading-tight">Todd | Customer Delight</h4>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Always Active • Typically replies instantly
                </p>
              </div>
            </div>

            {/* Subtle close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-blue-200/50 hover:text-white transition-colors"
              title="Minimize chat"
              aria-label="Close Todd Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-3.5 h-64 overflow-y-auto bg-neutral-50 flex flex-col gap-2.5 text-xs">
            <div className="text-center text-[10px] text-neutral-400 my-1 font-mono">
              Todd joined the session • AI Sentiment: OVERJOYED
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {msg.sender === 'todd' ? (
                  <img
                    src={toddPortrait}
                    alt="Todd"
                    className="w-6 h-6 rounded-full object-cover mt-0.5 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-neutral-600" />
                  </div>
                )}
                <div>
                  <div
                    className={`p-2.5 rounded-2xl shadow-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-neutral-400 px-1">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-neutral-200 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Todd anything..."
              className="flex-1 px-3 py-1.5 text-xs bg-neutral-100 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Send message to Todd"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Contact Bubble: visible once canStart is true or after initial popups */
        canStart && (
          <button
            onClick={() => {
              resumeAudioContext();
              setIsOpen(true);
              if (messages.length === 0) {
                deliverToddMessage(scriptedMessages[0]);
              }
            }}
            className="group relative flex items-center gap-2 p-1.5 pr-4 bg-white rounded-full shadow-2xl border-2 border-blue-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Open support chat with Todd"
          >
            <img
              src={toddPortrait}
              alt="Todd"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500"
            />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
              1
            </span>
            <div className="text-left">
              <p className="text-xs font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                Chat with Todd
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">Online now</p>
            </div>
          </button>
        )
      )}
    </div>
  );
};
