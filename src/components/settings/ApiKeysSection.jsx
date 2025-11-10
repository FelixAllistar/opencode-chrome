"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '../ui/form.tsx';

export const ApiKeysSection = ({
  form,
  handleSave,
  isSaved,
  lastSavedField,
  setActiveField,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const inputBaseClass =
    'w-full border px-2 py-1 rounded text-xs transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60';
  const getInputClass = (fieldName) =>
    `${inputBaseClass}${lastSavedField === fieldName ? ' ring-2 ring-primary/60 animate-pulse' : ''}`;

  return (
    <div className="border-t pt-2 space-y-2">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between px-2 py-1 text-xs font-medium text-muted-foreground"
      >
        <span>API Keys</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <Form {...form}>
          <form className="space-y-2 px-2" onSubmit={form.handleSubmit(handleSave)}>
            <FormField
              control={form.control}
              name="openCodeApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    OpenCode Zen API Key
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="password"
                      className={getInputClass('openCodeApiKey')}
                      onFocus={() => setActiveField('openCodeApiKey')}
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
                  <FormLabel className="text-xs text-muted-foreground">Gemini API Key</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="password"
                      className={getInputClass('googleApiKey')}
                      onFocus={() => setActiveField('googleApiKey')}
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
                  <FormControl>
                    <input
                      {...field}
                      type="password"
                      className={getInputClass('braveSearchApiKey')}
                      onFocus={() => setActiveField('braveSearchApiKey')}
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
                  <FormControl>
                    <input
                      {...field}
                      type="password"
                      className={getInputClass('context7ApiKey')}
                      onFocus={() => setActiveField('context7ApiKey')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div aria-live="polite" className="text-[10px] text-muted-foreground">
              {isSaved ? 'Keys saved' : 'Press Enter to save'}
            </div>
            <button type="submit" className="sr-only" aria-label="Save API keys" />
          </form>
        </Form>
      )}
    </div>
  );
};
