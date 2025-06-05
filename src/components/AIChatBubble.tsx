import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Minimize2, Maximize2, X, Key } from "lucide-react";

interface Message {
  type: "ai" | "user";
  content: string;
}

export const AIChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: "ai", content: "Hi! I'm your AI study assistant powered by Hugging Face. Ask me any doubt about your subjects!" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedApiKey = localStorage.getItem("huggingface_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("huggingface_api_key", apiKey);
      setShowApiKeyInput(false);
      setMessages([
        { type: "ai", content: "Great! API key saved. I'm ready to help you with your studies. Ask me anything!" }
      ]);
    }
  };

  const callHuggingFaceAPI = async (message: string) => {
    try {
      const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          inputs: `As a Class 10 tutor, help with this question: ${message}`,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Hugging Face API Error:", errorData);
        
        if (response.status === 401) {
          return "❌ Invalid API key. Please check your Hugging Face API key and try again.";
        } else if (response.status === 429) {
          return "⏰ Rate limit exceeded. Please wait a moment and try again.";
        } else {
          return `⚠️ API Error (${response.status}): ${errorData.error || 'Unknown error occurred'}`;
        }
      }

      const data = await response.json();
      return data[0]?.generated_text || "Sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Hugging Face API Error:", error);
      return "🔌 Connection error. Please check your internet connection and try again.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !apiKey) return;

    const userMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    // Add user message
    const newMessages = [...messages, { type: "user" as const, content: userMessage }];
    setMessages(newMessages);

    // Get AI response
    const aiResponse = await callHuggingFaceAPI(userMessage);
    
    setMessages([...newMessages, { type: "ai" as const, content: aiResponse }]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-[calc(16rem+1.5rem)] z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed z-40 ${isMaximized ? 'inset-4 left-[calc(16rem+1rem)]' : 'bottom-6 left-[calc(16rem+1.5rem)] w-80 h-96'}`}>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Study Assistant (Hugging Face)</CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              title="Manage API Key"
            >
              <Key className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          {showApiKeyInput && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Enter your Hugging Face API key:</p>
              <div className="flex space-x-2">
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="hf_..."
                  className="text-xs"
                />
                <Button onClick={saveApiKey} size="sm">
                  Save
                </Button>
              </div>
            </div>
          )}
          
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={apiKey ? "Ask me anything..." : "Enter API key first..."}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!apiKey || isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              size="sm" 
              disabled={!apiKey || isLoading || !inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};