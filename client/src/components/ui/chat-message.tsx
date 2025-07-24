import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "@/types";
import { format } from "date-fns";

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  senderName: string;
  senderAvatar?: string;
}

export function ChatMessage({ message, isOwnMessage, senderName, senderAvatar }: ChatMessageProps) {
  return (
    <div className={`flex items-start ${isOwnMessage ? 'justify-end' : ''}`}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback>
            {senderName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`${isOwnMessage ? 'mr-3' : 'ml-3'} max-w-xs`}>
        <div className={`rounded-lg px-4 py-2 ${
          isOwnMessage 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-slate-100 text-slate-900'
        }`}>
          <p>{message.content}</p>
        </div>
        <p className={`text-xs text-slate-500 mt-1 ${isOwnMessage ? 'text-right' : ''}`}>
          {format(new Date(message.createdAt), 'h:mm a')}
        </p>
      </div>
      {isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback>
            {senderName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
