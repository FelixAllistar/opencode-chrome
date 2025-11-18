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

const settingsSchema = z.object({
  openCodeApiKey: z.string(),
  googleApiKey: z.string(),
  braveSearchApiKey: z.string(),
  context7ApiKey: z.string(),
  openRouterApiKey: z.string(),
  anthropicApiKey: z.string(),
  openaiApiKey: z.string(),
});

const modelSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  type: z.enum(PROVIDER_TYPES),
  isVision: z.boolean(),
  supportsTools: z.boolean()
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
  providerTypes = PROVIDER_TYPES
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeField, setActiveField] = useState('openCodeApiKey');
  const [lastSavedField, setLastSavedField] = useState(null);
  const savedTimerRef = useRef(null);
  const menuRef = useRef(null);
  const [isModelsExpanded, setIsModelsExpanded] = useState(false);
  const [modelMessage, setModelMessage] = useState('');
  const modelSavedTimerRef = useRef(null);

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

  const availableProviders = providerTypes.length > 0 ? providerTypes : PROVIDER_TYPES;
  const modelForm = useForm({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      id: '',
      name: '',
      type: availableProviders[0],
      isVision: true,
      supportsTools: true
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
      if (modelSavedTimerRef.current) {
        clearTimeout(modelSavedTimerRef.current);
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

  const handleAddModel = (values) => {
    onAddCustomModel?.({
      ...values,
      id: values.id.trim(),
      name: values.name.trim()
    });
    setModelMessage('Model added');
    if (modelSavedTimerRef.current) {
      clearTimeout(modelSavedTimerRef.current);
    }
    modelSavedTimerRef.current = setTimeout(() => {
      setModelMessage('');
    }, 2000);
    modelForm.reset({
      ...modelForm.getValues(),
      id: '',
      name: ''
    });
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
            <div className="border-t pt-2 space-y-2">
              <button
                type="button"
                onClick={() => setIsModelsExpanded((prev) => !prev)}
                aria-expanded={isModelsExpanded}
                className="flex w-full items-center justify-between px-2 py-1 text-xs font-medium text-muted-foreground"
              >
                <span>Models</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isModelsExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              {isModelsExpanded && (
                <>
                  <div className="space-y-2 px-2">
                    {models.map((model) => {
                      const isChecked = enabledModelIds.includes(model.id);
                      const providerLabel = resolveProviderLabel(model.type);
                      const capabilityLabel = `${providerLabel} · ${model.isVision ? 'vision' : 'text'} · ${model.supportsTools ? 'tools' : 'no tools'}`;
                      return (
                        <div key={model.id} className="flex items-center justify-between">
                          <div className="pr-2">
                            <p className="text-sm font-medium">{model.name}</p>
                            <p className="text-[10px] text-muted-foreground">{capabilityLabel}</p>
                          </div>
                          <Switch
                            checked={isChecked}
                            onCheckedChange={(value) => onToggleModel?.(model.id, Boolean(value))}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2">
                    <Form {...modelForm}>
                      <form className="space-y-2 px-2 py-1" onSubmit={modelForm.handleSubmit(handleAddModel)}>
                        <FormField
                          control={modelForm.control}
                          name="id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">Model ID</FormLabel>
                              <FormControl>
                                <input
                                  {...field}
                                  type="text"
                                  className="w-full border px-2 py-1 text-xs rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={modelForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">Model Name</FormLabel>
                              <FormControl>
                                <input
                                  {...field}
                                  type="text"
                                  className="w-full border px-2 py-1 text-xs rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={modelForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">Provider</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="w-full border border-input bg-popover px-2 py-1 text-xs text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                >
                                  {availableProviders.map((provider) => (
                                    <option key={provider} value={provider}>
                                      {resolveProviderLabel(provider)}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={modelForm.control}
                          name="isVision"
                          render={({ field }) => (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium">Vision enabled</p>
                                <p className="text-[10px] text-muted-foreground">Send inline images/files</p>
                              </div>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(value) => field.onChange(Boolean(value))}
                              />
                            </div>
                          )}
                        />
                        <FormField
                          control={modelForm.control}
                          name="supportsTools"
                          render={({ field }) => (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium">Tool support</p>
                                <p className="text-[10px] text-muted-foreground">
                                  Allow tool loops for this model
                                </p>
                              </div>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(value) => field.onChange(Boolean(value))}
                              />
                            </div>
                          )}
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-muted-foreground">
                            {modelMessage || 'IDs must match the provider API string and appear in the dropdown.'}
                          </p>
                          <Button size="sm" type="submit">
                            Add model
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </>
              )}
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
