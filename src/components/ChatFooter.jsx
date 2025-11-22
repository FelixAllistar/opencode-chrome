"use client";

import React from 'react';
import { X } from 'lucide-react';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
} from './ai-elements/prompt-input.tsx';

export const ChatFooter = ({
  attachedContextSnippets,
  onRemoveContextSnippet,
  inputRef,
  onSubmit,
  isDevMode,
  selectedModelId,
  modelOptions,
  onChangeModel,
  chatStatus,
  onStop,
}) => {
  return (
    <div className="border-t bg-background p-4">
      <PromptInput onSubmit={onSubmit} accept="image/*" multiple globalDrop>
        <PromptInputBody>
          {attachedContextSnippets.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachedContextSnippets.map((snippet) => {
                const displayText =
                  snippet.text.length > 120
                    ? `${snippet.text.slice(0, 120)}…`
                    : snippet.text;
                return (
                  <div
                    key={snippet.id}
                    className="flex items-center gap-1 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-foreground"
                  >
                    <span className="max-w-[240px] truncate">{displayText}</span>
                    <button
                      type="button"
                      className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      aria-label="Remove attached context"
                      onClick={() => onRemoveContextSnippet?.(snippet.id)}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea inputRef={inputRef} disabled={chatStatus === 'error'} />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            {!isDevMode && (
              <PromptInputModelSelect onValueChange={onChangeModel} value={selectedModelId}>
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {modelOptions.map((model) => (
                    <PromptInputModelSelectItem key={model.id} value={model.id}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            )}
            {isDevMode && (
              <div className="text-xs text-muted-foreground px-2">
                Dev mode (OpenCode)
              </div>
            )}
          </PromptInputTools>
          <PromptInputSubmit status={chatStatus} onStop={onStop} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
};

