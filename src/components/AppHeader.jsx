"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import {
  SidebarTrigger,
} from './ui/sidebar.jsx';
import { Separator } from './ui/separator.jsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb.jsx';
import { Button } from './ui/button.jsx';
import { SettingsMenu } from './settings/SettingsMenu.jsx';

export const AppHeader = ({
  isDevMode,
  onSelectMode,
  onNewChat,
  currentChatTitle,
  opencodeBaseUrl,
  onChangeOpencodeBaseUrl,
  opencodeProjects,
  selectedProjectId,
  onProjectChange,
  opencodeSessions,
  selectedSessionId,
  onSessionChange,
  onSendConsoleLogs,
  onSendScreenshot,
  settingsMenuProps,
}) => {
  const handleChangeServerUrl = () => {
    const next = prompt('OpenCode server URL', opencodeBaseUrl);
    if (next) {
      onChangeOpencodeBaseUrl(next.trim());
    }
  };

  return (
    <header className="flex h-auto shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border/40">
      <div className="flex flex-wrap items-center justify-between px-4 py-2 w-full gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Button onClick={onNewChat} variant="ghost" size="default" className="h-12 w-12 p-0">
            <Plus className="h-8 w-8" />
          </Button>
          <div className="flex items-center gap-1 rounded-full border bg-background px-1 py-1">
            <Button
              variant={isDevMode ? 'ghost' : 'default'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onSelectMode('browser')}
            >
              Browser
            </Button>
            <Button
              variant={isDevMode ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onSelectMode('opencode')}
            >
              Dev
            </Button>
          </div>
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  AI Chat
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentChatTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end w-full md:w-auto">
          {isDevMode && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs max-w-[160px] truncate"
                onClick={handleChangeServerUrl}
              >
                {opencodeBaseUrl.replace(/^https?:\/\//, '')}
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">Project</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-xs min-w-[180px]"
                    value={selectedProjectId || ''}
                    onChange={(event) => onProjectChange?.(event.target.value)}
                  >
                    <option value="">Select project</option>
                    {opencodeProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.worktree}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">Session</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-xs min-w-[180px]"
                    value={selectedSessionId || ''}
                    disabled={!selectedProjectId}
                    onChange={(event) => onSessionChange?.(event.target.value)}
                  >
                    <option value="">
                      {selectedProjectId ? 'Select session' : 'Pick a project first'}
                    </option>
                    {opencodeSessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.title || session.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={onSendConsoleLogs}
              >
                Send console logs
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={onSendScreenshot}
              >
                Send screenshot
              </Button>
            </div>
          )}
          <SettingsMenu {...settingsMenuProps} />
        </div>
      </div>
    </header>
  );
};

