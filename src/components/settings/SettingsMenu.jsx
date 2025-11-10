"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings as SettingsIcon } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher.jsx';
import { Button } from '../ui/button.jsx';
import { Switch } from '../ui/switch.tsx';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '../ui/form.tsx';
import { TOOL_DEFINITIONS } from '../../services/ai/tools/index';

const settingsSchema = z.object({
  openCodeApiKey: z.string(),
  googleApiKey: z.string(),
  braveSearchApiKey: z.string(),
  context7ApiKey: z.string(),
});

export const SettingsMenu = ({
  apiKey = '',
  googleApiKey = '',
  braveSearchApiKey = '',
  context7ApiKey = '',
  enabledTools = [],
  onSaveKeys,
  onClear,
  onToggleTool
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const savedTimerRef = useRef(null);
  const menuRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      openCodeApiKey: apiKey,
      googleApiKey,
      braveSearchApiKey,
      context7ApiKey
    }
  });

  useEffect(() => {
    form.reset({
      openCodeApiKey: apiKey,
      googleApiKey,
      braveSearchApiKey,
      context7ApiKey
    });
  }, [apiKey, googleApiKey, braveSearchApiKey, context7ApiKey, form]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  const handleSave = (values) => {
    onSaveKeys?.(
      values.openCodeApiKey,
      values.googleApiKey,
      values.braveSearchApiKey,
      values.context7ApiKey
    );

    setIsSaved(true);
    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
    }
    savedTimerRef.current = setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClear = () => {
    onClear?.();
    form.reset({
      openCodeApiKey: '',
      googleApiKey: '',
      braveSearchApiKey: '',
      context7ApiKey: ''
    });
    setIsOpen(false);
    setIsSaved(false);
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
            <Form {...form}>
              <form className="border-t pt-2 space-y-2" onSubmit={form.handleSubmit(handleSave)}>
                <FormField
                  control={form.control}
                  name="openCodeApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">OpenCode Zen API Key</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="password"
                          className="w-full border px-2 py-1 rounded text-xs"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="googleApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Gemini API Key
                      </FormLabel>
                      <FormDescription className="text-[10px]">optional</FormDescription>
                      <FormControl>
                        <input
                          {...field}
                          type="password"
                          className="w-full border px-2 py-1 rounded text-xs"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="braveSearchApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Brave Search API Key
                      </FormLabel>
                      <FormDescription className="text-[10px]">optional</FormDescription>
                      <FormControl>
                        <input
                          {...field}
                          type="password"
                          className="w-full border px-2 py-1 rounded text-xs"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="context7ApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Context7 API Key
                      </FormLabel>
                      <FormDescription className="text-[10px]">optional</FormDescription>
                      <FormControl>
                        <input
                          {...field}
                          type="password"
                          className="w-full border px-2 py-1 rounded text-xs"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div
                  aria-live="polite"
                  className="text-[10px] text-muted-foreground"
                >
                  {isSaved ? 'Keys saved' : 'Press Enter to save'}
                </div>
              </form>
            </Form>
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
