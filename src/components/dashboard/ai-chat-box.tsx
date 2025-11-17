'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Sparkles, Send, X, Bot, User, HelpCircle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';

type Message = {
  role: 'user' | 'model';
  content: string;
};

const suggestionPrompts = [
    "How do I start investing?",
    "Explain the 50/30/20 budget rule.",
    "What's the difference between a Roth IRA and a 401(k)?",
]

export function AiChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMessage: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/openai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();
      const modelMessage: Message = { role: 'model', content: data.response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: '<p>Sorry, I encountered an error. Please try again.</p>',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/40"
          onClick={toggleChat}
        >
          {isOpen ? <X className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm">
          <Card className="flex flex-col h-[60vh] glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-primary" />
                AI Financial Assistant
              </CardTitle>
              <CardDescription>
                Ask me anything about your finances.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.length === 0 && !isLoading && (
                    <div className="text-center text-muted-foreground p-4 space-y-4">
                        <HelpCircle className="mx-auto h-10 w-10 text-primary/70" />
                        <h3 className="font-semibold">Not sure where to start?</h3>
                        <p className="text-sm">Try one of these common questions:</p>
                        <div className="flex flex-col gap-2">
                            {suggestionPrompts.map(prompt => (
                                <Button
                                    key={prompt}
                                    variant="outline"
                                    className="text-left justify-start h-auto py-2"
                                    onClick={() => handleSend(prompt)}
                                >
                                    {prompt}
                                </Button>
                            ))}
                        </div>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'model' && (
                        <Avatar className="w-8 h-8 border-2 border-primary">
                          <AvatarFallback className="bg-primary/20">
                            <Bot className="w-5 h-5 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'rounded-xl px-4 py-2 max-w-[80%]',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/60'
                        )}
                      >
                        <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: message.content }} />
                      </div>
                       {message.role === 'user' && (
                        <Avatar className="w-8 h-8 bg-muted/80">
                           <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-3">
                       <Avatar className="w-8 h-8 border-2 border-primary">
                           <AvatarFallback className="bg-primary/20">
                            <Bot className="w-5 h-5 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                      <div className="bg-muted/60 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-0"></span>
                            <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150"></span>
                            <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex w-full items-center space-x-2"
              >
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
