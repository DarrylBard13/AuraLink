
import React, { useState, useEffect, useRef } from "react";
// Mock agentSDK for development - replace with real implementation
const agentSDK = {
  async createConversation(config) {
    return { id: 'mock-conversation', messages: [], ...config };
  },
  async getConversation(id) {
    return { id, messages: [] };
  },
  async addMessage(conversation, message) {
    console.log('Mock: Adding message', message);
  },
  subscribeToConversation(id, callback) {
    return () => {}; // unsubscribe function
  }
};
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Send, Loader2, Bot, Trash2, Paperclip, X, FileText, Image, Calculator } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { format, addMonths, startOfMonth } from "date-fns";
import MessageBubble from "../components/assistant/MessageBubble";

const AGENT_NAME = "budget_builder";
const CONVERSATION_ID_KEY = `auralink_conversation_id_${AGENT_NAME}`;

function BudgetBuilderPageContent() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  // Calculate next cycle start date
  const getNextCycleStartDate = () => {
    const now = new Date();
    const nextMonth = addMonths(now, 1);
    const firstOfNextMonth = startOfMonth(nextMonth);
    return format(firstOfNextMonth, 'MMMM do, yyyy') + ' at 12:00 AM';
  };

  useEffect(() => {
    const initConversation = async () => {
      setIsLoading(true);
      try {
        const urlConversationId = null;
        const prefillPrompt = null;
        
        let conversationId = urlConversationId || localStorage.getItem(CONVERSATION_ID_KEY);
        let conv = null;

        // Try to load existing conversation first
        if (conversationId) {
          try {
            conv = await agentSDK.getConversation(conversationId);
            console.log("Loaded conversation:", conv.id);
            // If we loaded from a URL param, update localStorage
            if (urlConversationId && urlConversationId !== localStorage.getItem(CONVERSATION_ID_KEY)) {
              localStorage.setItem(CONVERSATION_ID_KEY, urlConversationId);
            }
          } catch (error) {
            console.log("Failed to load existing conversation, creating new one");
            // If conversation doesn't exist anymore, remove the stored ID
            localStorage.removeItem(CONVERSATION_ID_KEY);
            conv = null;
          }
        }

        // Only create new conversation if we don't have a valid existing one
        if (!conv) {
          conv = await agentSDK.createConversation({
            agent_name: AGENT_NAME,
            metadata: { name: "Budget Builder Chat" }
          });
          localStorage.setItem(CONVERSATION_ID_KEY, conv.id);
          console.log("Created new conversation:", conv.id);
        }

        setConversation(conv);
        
        // Set messages from existing conversation or create welcome message for new conversation
        if (conv.messages && conv.messages.length > 0) {
          setMessages(conv.messages);
        } else {
          // Only add welcome message for truly new conversations
          const currentMonth = format(new Date(), 'MMMM yyyy');
          const welcomeMessage = {
            id: 'welcome',
            role: 'assistant',
            content: `Hello! I'm your Budget Builder AI assistant! 📊 I can help you create comprehensive monthly budgets by analyzing your bills, subscriptions, and income sources from AuraLink. I can break down expenses by category, provide financial insights, and generate detailed budget reports. \n\nCurrently working with data for ${currentMonth}. How would you like to get started with your budget planning?`,
            created_date: new Date().toISOString()
          };
          setMessages([welcomeMessage]);
        }

        
        setIsLoading(false);

      } catch (error) {
        console.error("Failed to initialize conversation:", error);
        toast.error("Could not start a conversation with the budget builder.");
        setIsLoading(false);
      }
    };

    initConversation();
  }, []); 

  // Extract conversation ID as primitive to prevent object reference changes
  const conversationId = conversation?.id;

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = agentSDK.subscribeToConversation(conversationId, (data) => {
        setMessages(data.messages);
        const lastMessage = data.messages[data.messages.length - 1];

        // New logic to determine if the agent is waiting for user input
        if (lastMessage?.role === 'assistant') {
            // Check if there are any tool calls that are still running.
            const isAgentWorking = lastMessage.tool_calls?.some(
                (call) => call.status === 'running' || call.status === 'in_progress'
            );

            // If the agent is not actively working on a tool, it's the user's turn.
            if (!isAgentWorking) {
                setIsLoading(false);
            }
        }
    });

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && uploadedFiles.length === 0) || isLoading || !conversation) return;

    setIsLoading(true);
    const messageContent = inputMessage.trim();
    const fileUrls = uploadedFiles.map(f => f.url);
    setInputMessage('');
    setUploadedFiles([]);

    try {
      await agentSDK.addMessage(conversation, {
        role: "user",
        content: messageContent,
        file_urls: fileUrls.length > 0 ? fileUrls : undefined
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message to the assistant.");
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await UploadFile({ file });
        return {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: file_url
        };
      });

      const newFiles = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files. Please try again.");
    } finally {
      event.target.value = ''; // Clear input to allow re-uploading the same file
      setIsUploading(false);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = async () => {
    if (window.confirm("Are you sure you want to start a new conversation?")) {
      setIsLoading(true);
      try {
        // Remove the old conversation ID from localStorage
        localStorage.removeItem(CONVERSATION_ID_KEY);
        
        // Create a new conversation
        const newConv = await agentSDK.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: "Budget Builder Chat" }
        });
        localStorage.setItem(CONVERSATION_ID_KEY, newConv.id);
        setConversation(newConv);
        
        // Set new welcome message
        const currentMonth = format(new Date(), 'MMMM yyyy');
        setMessages([{
          id: 'welcome_new',
          role: 'assistant',
          content: `Hello! I'm your Budget Builder AI assistant! 📊 I can help you create comprehensive monthly budgets for ${currentMonth}. What would you like to work on today?`,
          created_date: new Date().toISOString()
        }]);
        
        console.log("Started new conversation:", newConv.id);
      } catch (error) {
        console.error("Failed to create new conversation:", error);
        toast.error("Could not start a new conversation.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Budget Builder AI</h1>
          <p className="text-white/80">Intelligent Monthly Budget Creation & Analysis</p>
        </div>
        <div className="flex gap-2 lg:flex-shrink-0">
          <Button
            onClick={clearConversation}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </motion.div>

      <Card className="glass-panel flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <ScrollArea className="flex-1 p-6" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <MessageBubble message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && messages[messages.length-1]?.role === 'user' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm text-white p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing your financial data...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {uploadedFiles.length > 0 && (
            <div className="border-t border-white/10 p-4">
              <div className="space-y-2">
                <p className="text-xs text-white/70">Uploaded files:</p>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                      {file.type.startsWith('image/') ? 
                        <Image className="w-4 h-4 text-white" /> : 
                        <FileText className="w-4 h-4 text-white" />
                      }
                      <span className="text-sm text-white truncate max-w-32">{file.name}</span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-white/50 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-white/10 p-4">
            <div className="flex gap-3">
              <div className="flex items-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading || isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isUploading ? 
                    'bg-gray-500 cursor-not-allowed' : 
                    'bg-white/10 hover:bg-white/15 text-white/70 hover:text-white'
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Paperclip className="w-5 h-5" />
                  )}
                </label>
              </div>
              
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about creating budgets, analyzing expenses..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                disabled={isLoading} />

              <Button
                onClick={handleSendMessage}
                disabled={(!inputMessage.trim() && uploadedFiles.length === 0) || isLoading}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">

                {isLoading && messages[messages.length-1]?.role === 'user' ?
                <Loader2 className="w-4 h-4 animate-spin" /> :
                <Send className="w-4 h-4" />
                }
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BudgetBuilderPage() {
  return <BudgetBuilderPageContent />;
}
