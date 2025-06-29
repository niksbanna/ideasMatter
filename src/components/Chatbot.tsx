import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { chatbotService, PREDEFINED_QUESTIONS, type ChatMessage, type PredefinedQuestion } from '../services/chatbot';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'bot',
        content: `👋 Welcome to IdeasMatter! I'm here to help you navigate our AI-powered civic engagement platform.

I can answer questions about:
• Submitting policy proposals
• How our AI generates policy drafts  
• Voting and community features
• Account benefits and platform features

Click on a question below or ask me anything about IdeasMatter!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (content: string, questionId?: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowQuestions(false);
    setIsTyping(true);

    try {
      // Get bot response
      const response = await chatbotService.getResponse(content, questionId);
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I'm having trouble responding right now. Please try asking about IdeasMatter features like submitting proposals, voting, or how our AI works!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuestionClick = (question: PredefinedQuestion) => {
    handleSendMessage(question.question, question.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupQuestionsByCategory = () => {
    const grouped = PREDEFINED_QUESTIONS.reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push(question);
      return acc;
    }, {} as Record<string, PredefinedQuestion[]>);

    return grouped;
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'getting-started': return '🚀 Getting Started';
      case 'features': return '⚡ Features';
      case 'how-it-works': return '🔧 How It Works';
      case 'account': return '👤 Account';
      default: return category;
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            ?
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Need help? Ask me anything about IdeasMatter!
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 transition-all duration-200 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">IdeasMatter Assistant</h3>
                <p className="text-xs text-blue-100">Here to help with your questions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMinimize}
                className="text-white/80 hover:text-white transition-colors"
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={toggleChat}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[440px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}>
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-[80%]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-slate-100 rounded-2xl px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                          <span className="text-sm text-slate-600">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Predefined Questions */}
                {showQuestions && messages.length <= 1 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 font-medium">Quick Questions</p>
                    </div>
                    
                    {Object.entries(groupQuestionsByCategory()).map(([category, questions]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {getCategoryTitle(category)}
                        </h4>
                        <div className="grid gap-2">
                          {questions.map((question) => (
                            <button
                              key={question.id}
                              onClick={() => handleQuestionClick(question)}
                              className="text-left p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors text-sm"
                            >
                              <span className="mr-2">{question.icon}</span>
                              {question.question}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-slate-200 p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me about IdeasMatter..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                
                <p className="text-xs text-slate-500 mt-2 text-center">
                  I can only help with questions about IdeasMatter and civic engagement
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};