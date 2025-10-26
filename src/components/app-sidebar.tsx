"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface Chat {
  id: string;
  title: string;
  updatedAt: number;
  messageCount: number;
  lastMessage?: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export function AppSidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Button onClick={onNewChat} className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <div className="space-y-1 p-2">
          {chats.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-4">
              No chats yet. Start a new conversation!
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  chat.id === currentChatId
                    ? 'bg-accent border'
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">
                      {chat.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(chat.updatedAt)}
                      </span>
                      {chat.messageCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {chat.messageCount} msgs
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
