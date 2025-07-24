import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "@/components/ui/chat-message";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserWithProfile, Message } from "@/types";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const { user: currentUser } = useAuth();
  const [, params] = useRoute("/chat/:userId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const otherUserId = params?.userId ? parseInt(params.userId) : null;
  
  const { data: otherUser } = useQuery<UserWithProfile>({
    queryKey: ["/api/users", otherUserId],
    queryFn: () => 
      fetch(`/api/users/${otherUserId}`, { credentials: "include" })
        .then(res => res.json()),
    enabled: !!otherUserId,
  });

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", otherUserId],
    queryFn: () => 
      fetch(`/api/messages/${otherUserId}`, { credentials: "include" })
        .then(res => res.json()),
    enabled: !!otherUserId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        toUserId: otherUserId,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", otherUserId] });
      setMessageInput("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Handle new WebSocket messages
  useEffect(() => {
    if (lastMessage && 
        ((lastMessage.fromUserId === otherUserId && lastMessage.toUserId === currentUser?.id) ||
         (lastMessage.fromUserId === currentUser?.id && lastMessage.toUserId === otherUserId))) {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", otherUserId] });
    }
  }, [lastMessage, otherUserId, currentUser?.id, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleGoBack = () => {
    if (currentUser?.role === 'investor') {
      setLocation('/dashboard/investor');
    } else {
      setLocation('/dashboard/entrepreneur');
    }
  };

  if (!currentUser || !otherUser) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-slate-900">Loading...</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card className="h-[calc(100vh-12rem)] flex flex-col">
        {/* Chat Header */}
        <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center space-y-0">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.profileImageUrl} alt={`${otherUser.firstName} ${otherUser.lastName}`} />
            <AvatarFallback>
              {otherUser.firstName[0]}{otherUser.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h3 className="font-semibold text-slate-900">
              {otherUser.firstName} {otherUser.lastName}
            </h3>
            <p className="text-sm text-emerald-600 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              Online
            </p>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwnMessage={message.fromUserId === currentUser.id}
                senderName={
                  message.fromUserId === currentUser.id 
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : `${otherUser.firstName} ${otherUser.lastName}`
                }
                senderAvatar={
                  message.fromUserId === currentUser.id 
                    ? currentUser.profileImageUrl
                    : otherUser.profileImageUrl
                }
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input */}
        <div className="p-4 border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button type="submit" size="icon" disabled={sendMessageMutation.isPending || !messageInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </DashboardLayout>
  );
}
