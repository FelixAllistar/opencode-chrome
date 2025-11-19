"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, Settings as SettingsIcon } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher.jsx';
import { Button } from '../ui/button.jsx';
import { Switch } from '../ui/switch.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form.tsx';
import { ApiKeysSection } from './ApiKeysSection.jsx';
import { TOOL_DEFINITIONS } from '../../services/ai/tools/index';
import { PROVIDER_TYPES, PROVIDER_LABELS } from '../../utils/constants.js';
import { ModelManager } from './ModelManager.jsx';

const settingsSchema = z.object({
  openCodeApiKey: z.string(),
  googleApiKey: z.string(),
  braveSearchApiKey: z.string(),
  context7ApiKey: z.string(),
  openRouterApiKey: z.string(),
  anthropicApiKey: z.string(),
  openaiApiKey: z.string(),
});



export const SettingsMenu = ({
  apiKey = '',
  googleApiKey = '',
  braveSearchApiKey = '',
  context7ApiKey = '',
  openRouterApiKey = '',
  anthropicApiKey = '',
  openaiApiKey = '',
  enabledTools = [],
  onSaveKeys,
  onClear,
  onToggleTool,
  models = [],
  enabledModelIds = [],
  onToggleModel,
  onAddCustomModel,
  customModels = [],
  onDeleteCustomModel,
  providerTypes = PROVIDER_TYPES
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeField, setActiveField] = useState('openCodeApiKey');
  const [lastSavedField, setLastSavedField] = useState(null);
  const savedTimerRef = useRef(null);
  const menuRef = useRef(null);

  const [isToolsExpanded, setIsToolsExpanded] = useState(false);
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);


  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      openCodeApiKey: apiKey,
      googleApiKey,
      braveSearchApiKey,
      context7ApiKey,
      openRouterApiKey,
      anthropicApiKey,
      openaiApiKey
    }
  });



  useEffect(() => {
    form.reset({
      openCodeApiKey: apiKey,
      googleApiKey,
      braveSearchApiKey,
      context7ApiKey,
      openRouterApiKey,
      anthropicApiKey,
      openaiApiKey
    });
  }, [apiKey, googleApiKey, braveSearchApiKey, context7ApiKey, openRouterApiKey, anthropicApiKey, openaiApiKey, form]);

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
      values.context7ApiKey,
      values.openRouterApiKey,
      values.anthropicApiKey,
      values.openaiApiKey
    );

    setIsSaved(true);
    setLastSavedField(activeField);

    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
    }
    savedTimerRef.current = setTimeout(() => {
      setIsSaved(false);
      setLastSavedField(null);
    }, 2000);
  };

  const handleClear = () => {
    onClear?.();
    form.reset({
      openCodeApiKey: '',
      googleApiKey: '',
      braveSearchApiKey: '',
      context7ApiKey: '',
      openRouterApiKey: '',
      anthropicApiKey: '',
      openaiApiKey: ''
    });
    setIsOpen(false);
    setIsSaved(false);
    setLastSavedField(null);
  };



  const resolveProviderLabel = (provider) => PROVIDER_LABELS[provider] ?? provider;

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
            <ApiKeysSection
              form={form}
              handleSave={handleSave}
              isSaved={isSaved}
              lastSavedField={lastSavedField}
              setActiveField={setActiveField}
            />
            <div className="border-t pt-2 space-y-2">
              <button
                type="button"
                onClick={() => setIsToolsExpanded((prev) => !prev)}
                aria-expanded={isToolsExpanded}
                className="flex w-full items-center justify-between px-2 py-1 text-xs font-medium text-muted-foreground"
              >
                <span>Tools</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isToolsExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              {isToolsExpanded && (
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
              )}
            </div>
            <div className="border-t pt-2 space-y-2">
              <button
                type="button"
                onClick={() => setIsModelManagerOpen(true)}
                className="flex w-full items-center justify-between px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Models</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {enabledModelIds.length} enabled
                  </span>
                  <ChevronDown className="h-4 w-4 -rotate-90 opacity-50" />
                </div>
              </button>
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
      <ModelManager
        open={isModelManagerOpen}
        onOpenChange={setIsModelManagerOpen}
        models={models}
        enabledModelIds={enabledModelIds}
        customModels={customModels}
        onToggleModel={onToggleModel}
        onDeleteCustomModel={onDeleteCustomModel}
        onAddCustomModel={onAddCustomModel}
      />
    </div>
  );
};
