"use client";

import { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher.jsx';
import { Button } from '../ui/button.jsx';
import { Switch } from '../ui/switch.tsx';
import { TOOL_DEFINITIONS } from '../../services/ai/tools/index';

export const SettingsMenu = ({
  apiKey = '',
  googleApiKey = '',
  braveSearchApiKey = '',
  enabledTools = [],
  onSaveKeys,
  onClear,
  onToggleTool
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localGoogleApiKey, setLocalGoogleApiKey] = useState(googleApiKey);
  const [localBraveSearchApiKey, setLocalBraveSearchApiKey] = useState(braveSearchApiKey);
  const menuRef = useRef(null);

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);

  useEffect(() => {
    setLocalGoogleApiKey(googleApiKey);
  }, [googleApiKey]);

  useEffect(() => {
    setLocalBraveSearchApiKey(braveSearchApiKey);
  }, [braveSearchApiKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    if (onSaveKeys) {
      onSaveKeys(localApiKey, localGoogleApiKey, localBraveSearchApiKey);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    setLocalBraveSearchApiKey('');
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="ghost"
        size="default"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-12 w-12 p-0"
      >
        <SettingsIcon className="h-8 w-8" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-popover border rounded-md shadow-lg z-50">
          <div className="p-2 space-y-3">
            <div className="px-2 py-1 text-sm font-medium">Settings</div>
            <div className="border-t pt-2 space-y-2">
              <div className="px-2 py-1 text-xs text-muted-foreground">Theme</div>
              <div className="p-2">
                <ThemeSwitcher />
              </div>
            </div>
            <div className="border-t pt-2 space-y-2">
              <label className="text-xs text-muted-foreground">OpenCode Zen API Key</label>
              <input
                type="password"
                className="w-full border px-2 py-1 rounded text-xs"
                value={localApiKey}
                onChange={(event) => setLocalApiKey(event.target.value)}
              />
              <label className="text-xs text-muted-foreground">
                Gemini API Key <span className="text-[10px] text-muted-foreground">optional</span>
              </label>
              <input
                type="password"
                className="w-full border px-2 py-1 rounded text-xs"
                value={localGoogleApiKey}
                onChange={(event) => setLocalGoogleApiKey(event.target.value)}
              />
              <label className="text-xs text-muted-foreground">
                Brave Search API Key <span className="text-[10px] text-muted-foreground">optional</span>
              </label>
              <input
                type="password"
                className="w-full border px-2 py-1 rounded text-xs"
                value={localBraveSearchApiKey}
                onChange={(event) => setLocalBraveSearchApiKey(event.target.value)}
              />
              <Button variant="secondary" size="default" className="w-full text-xs" onClick={handleSave}>
                Save Keys
              </Button>
            </div>
            <div className="border-t pt-2 space-y-2">
              <div className="px-2 py-1 text-xs text-muted-foreground">Tools</div>
              <div className="space-y-2 px-2">
                {TOOL_DEFINITIONS.map((definition) => {
                  const isChecked = enabledTools.includes(definition.id);
                  return (
                    <div key={definition.id} className="flex items-center justify-between">
                      <div className="pr-2">
                        <p className="text-sm font-medium">{definition.label}</p>
                        <p className="text-[10px] text-muted-foreground">{definition.description}</p>
                      </div>
                      <Switch
                        checked={isChecked}
                        onCheckedChange={(value) => onToggleTool?.(definition.id, Boolean(value))}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded text-destructive"
            >
              Clear All Chats
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
