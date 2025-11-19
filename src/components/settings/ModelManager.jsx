"use client";

import { useMemo, useState } from 'react';
import { Search, Eye, Wrench, Plus, X, Trash2, Check, Filter } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Switch } from '../ui/switch.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog.tsx';
import { cn } from '@/lib/utils';
import { PROVIDER_LABELS } from '../../utils/constants.js';

const getProviderLabel = (provider) => PROVIDER_LABELS[provider] ?? provider;

export const ModelManager = ({
  open,
  onOpenChange,
  models,
  enabledModelIds,
  customModels,
  onToggleModel,
  onDeleteCustomModel,
  onAddCustomModel
}) => {
  const [search, setSearch] = useState('');
  const [showVision, setShowVision] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [isAddingModel, setIsAddingModel] = useState(false);

  // Add Model State
  const [newModelId, setNewModelId] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelProvider, setNewModelProvider] = useState('');
  const [newModelVision, setNewModelVision] = useState(true);
  const [newModelTools, setNewModelTools] = useState(true);

  const effectiveModels = useMemo(
    () => [...models, ...(customModels ?? [])],
    [models, customModels]
  );

  const providers = useMemo(() => {
    const all = new Set(effectiveModels.map((model) => model.type));
    return Array.from(all);
  }, [effectiveModels]);

  const providerOptions = providers.map((provider) => ({
    id: provider,
    label: getProviderLabel(provider)
  }));

  const filteredModels = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();

    return effectiveModels.filter((model) => {
      if (showVision && !model.isVision) return false;
      if (showTools && !model.supportsTools) return false;

      if (lowerSearch) {
        const haystack = `${model.name} ${model.id}`.toLowerCase();
        if (!haystack.includes(lowerSearch)) return false;
      }

      return true;
    });
  }, [effectiveModels, search, showVision, showTools]);

  const groupedModels = useMemo(() => {
    const groups = new Map();
    filteredModels.forEach((model) => {
      if (!groups.has(model.type)) {
        groups.set(model.type, []);
      }
      groups.get(model.type).push(model);
    });
    return groups;
  }, [filteredModels]);

  const handleAddModel = (e) => {
    e.preventDefault();
    const trimmedId = newModelId.trim();
    const trimmedName = newModelName.trim();
    const provider = newModelProvider || providers[0];

    if (!trimmedId || !trimmedName || !provider) return;

    onAddCustomModel?.({
      id: trimmedId,
      name: trimmedName,
      type: provider,
      isVision: newModelVision,
      supportsTools: newModelTools
    });

    // Reset and close
    setNewModelId('');
    setNewModelName('');
    setIsAddingModel(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Manage Models</DialogTitle>
              <DialogDescription className="mt-1">
                Configure available models and add custom ones.
              </DialogDescription>
            </div>
            <Button
              onClick={() => setIsAddingModel(true)}
              size="sm"
              variant="secondary"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Custom Model
            </Button>
          </div>
        </DialogHeader>

        {isAddingModel ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-md mx-auto space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Add Custom Model</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the details for your custom model. Ensure the ID matches exactly what the provider expects.
                </p>
              </div>

              <form onSubmit={handleAddModel} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider</label>
                  <select
                    value={newModelProvider}
                    onChange={(e) => setNewModelProvider(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select a provider</option>
                    {providerOptions.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model Name</label>
                    <input
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      placeholder="e.g. GPT-4 Custom"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model ID</label>
                    <input
                      value={newModelId}
                      onChange={(e) => setNewModelId(e.target.value)}
                      placeholder="e.g. gpt-4-custom-v1"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch checked={newModelVision} onCheckedChange={setNewModelVision} />
                    <span>Supports Vision</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch checked={newModelTools} onCheckedChange={setNewModelTools} />
                    <span>Supports Tools</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddingModel(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Model
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b bg-muted/30 flex gap-3 items-center shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search models..."
                  className="w-full bg-background pl-9 pr-4 py-1.5 text-sm rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div className="flex items-center gap-2 border-l pl-3 ml-1">
                <Button
                  variant={showVision ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setShowVision(!showVision)}
                  className={cn("h-8 px-2.5 gap-1.5", showVision && "bg-primary/15 text-primary hover:bg-primary/20")}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-xs">Vision</span>
                </Button>
                <Button
                  variant={showTools ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setShowTools(!showTools)}
                  className={cn("h-8 px-2.5 gap-1.5", showTools && "bg-primary/15 text-primary hover:bg-primary/20")}
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span className="text-xs">Tools</span>
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {providerOptions.map((provider) => {
                const group = groupedModels.get(provider.id);
                if (!group?.length) return null;

                return (
                  <div key={provider.id} className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      {provider.label}
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground/70">
                        {group.length}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {group.map((model) => {
                        const isEnabled = enabledModelIds.includes(model.id);
                        const isCustom = !!customModels?.find(c => c.id === model.id);

                        return (
                          <div
                            key={model.id}
                            className={cn(
                              "group flex items-center justify-between p-3 rounded-lg border bg-card transition-all hover:border-primary/50",
                              isEnabled ? "border-primary/30 bg-primary/5" : "opacity-80 hover:opacity-100"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-sm truncate">{model.name}</span>
                                  {isCustom && (
                                    <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
                                      Custom
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground truncate font-mono opacity-70">
                                  {model.id}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="flex items-center gap-1.5">
                                {model.isVision && (
                                  <div className="p-1.5 rounded-md bg-muted text-muted-foreground" title="Supports Vision">
                                    <Eye className="h-3.5 w-3.5" />
                                  </div>
                                )}
                                {model.supportsTools && (
                                  <div className="p-1.5 rounded-md bg-muted text-muted-foreground" title="Supports Tools">
                                    <Wrench className="h-3.5 w-3.5" />
                                  </div>
                                )}
                              </div>

                              {isCustom && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => onDeleteCustomModel?.(model.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}

                              <Switch
                                checked={isEnabled}
                                onCheckedChange={(val) => onToggleModel?.(model.id, val)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredModels.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Filter className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p>No models found matching your filters.</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearch('');
                      setShowVision(false);
                      setShowTools(false);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

