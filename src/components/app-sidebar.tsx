"use client"

import * as React from "react"
import { Check, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

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
  selectedChatIds: string[];
  selectionMode: boolean;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onToggleSelectionMode: () => void;
  onToggleChatSelection: (chatId: string) => void;
  onClearSelection: () => void;
  onDeleteSelectedChats: () => void;
  onSelectAllChats: () => void;
  isAllSelected: boolean;
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
  selectedChatIds,
  selectionMode,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onToggleSelectionMode,
  onToggleChatSelection,
  onClearSelection,
  onDeleteSelectedChats,
  onSelectAllChats,
  isAllSelected,
  ...props
}: AppSidebarProps) {
  const selectedCount = selectedChatIds.length;
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="space-y-2 px-3 py-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Conversations
            </p>
            <p className="text-base font-semibold text-sidebar-foreground">
              Chats
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              aria-label="Start a new chat"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant={selectionMode ? "secondary" : "outline"}
              size="sm"
              className="font-semibold"
              onClick={onToggleSelectionMode}
            >
              {selectionMode ? "Done" : "Select"}
            </Button>
          </div>
        </div>

        {selectionMode && (
          <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/70 px-2 py-1 text-xs text-muted-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {selectedCount > 0
                  ? `${selectedCount} of ${chats.length} selected`
                  : 'Tap chats to select'}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-80 px-2 text-[11px]"
                onClick={onSelectAllChats}
              >
                {isAllSelected ? 'Deselect all' : 'Select all'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={onDeleteSelectedChats}
                disabled={selectedCount === 0}
              >
                Delete selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onClearSelection}
                disabled={selectedCount === 0}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <div className="space-y-1 p-2">
          {chats.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-4">
              No chats yet. Start a new conversation!
            </div>
          ) : (
            chats.map((chat) => {
              const isSelected = selectedChatIds.includes(chat.id);
              return (
                <div
                  key={chat.id}
                  className={cn(
                    'group relative flex cursor-pointer items-start justify-between gap-3 rounded-lg border px-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    chat.id === currentChatId
                      ? 'bg-sidebar-accent border-sidebar-border'
                      : 'border-transparent',
                    selectionMode
                      ? 'hover:border-border/60 hover:bg-muted/10 dark:hover:border-muted/70'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                    isSelected &&
                      'border-ring bg-primary/10 text-sidebar-foreground dark:border-ring dark:bg-primary/20'
                  )}
                  onClick={() => {
                    if (selectionMode) {
                      onToggleChatSelection(chat.id);
                      return;
                    }

                    onSelectChat(chat.id);
                    setTimeout(() => {
                      const toggleButton = document.querySelector('[data-sidebar="trigger"]');
                      if (toggleButton) {
                        toggleButton.click();
                      }
                    }, 100);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-1 items-start gap-3">
                      {selectionMode && (
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          aria-label={isSelected ? 'Deselect chat' : 'Select chat'}
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleChatSelection(chat.id);
                          }}
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            isSelected
                              ? 'border-transparent bg-primary text-primary-foreground'
                              : 'border-border/60 bg-transparent text-muted-foreground'
                          )}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3" />
                          )}
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate text-sidebar-foreground">
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
                          <p className="text-xs mt-1 truncate text-muted-foreground">
                            {chat.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    {!selectionMode && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
