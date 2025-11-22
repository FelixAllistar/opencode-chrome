"use client";

import { useCallback, useEffect, useMemo } from 'react';
import { useStorage } from './useStorage.js';
import {
  MODELS,
  DEFAULT_MODEL_PREFERENCES,
  DEFAULT_ENABLED_MODEL_IDS,
} from '@/utils/constants.js';

export function useModelConfig() {
  const [selectedModelId, setSelectedModelId, isModelLoading] = useStorage(
    'selectedModelId',
    MODELS[0].id
  );
  const [modelPreferences, setModelPreferences] = useStorage(
    'modelPreferences',
    DEFAULT_MODEL_PREFERENCES
  );

  const customModels = modelPreferences?.customModels ?? [];

  const availableModels = useMemo(
    () => [...MODELS, ...customModels],
    [customModels]
  );

  const enabledModelIds = Array.isArray(modelPreferences?.enabledModelIds)
    ? modelPreferences.enabledModelIds
    : DEFAULT_ENABLED_MODEL_IDS;

  const enabledModels = useMemo(
    () => availableModels.filter((model) => enabledModelIds.includes(model.id)),
    [availableModels, enabledModelIds]
  );

  const selectedModel =
    enabledModels.find((model) => model.id === selectedModelId) ??
    enabledModels[0] ??
    availableModels[0] ??
    MODELS[0];

  const modelOptions = enabledModels.length > 0 ? enabledModels : availableModels;

  useEffect(() => {
    if (enabledModels.length === 0) {
      return;
    }

    if (!enabledModels.some((model) => model.id === selectedModelId)) {
      setSelectedModelId(enabledModels[0].id);
    }
  }, [enabledModels, selectedModelId, setSelectedModelId]);

  const changeModel = useCallback(
    (modelId) => {
      if (enabledModels.some((model) => model.id === modelId)) {
        setSelectedModelId(modelId);
      }
    },
    [enabledModels, setSelectedModelId]
  );

  const toggleModelAvailability = useCallback(
    (modelId, enabled) => {
      setModelPreferences((prev = DEFAULT_MODEL_PREFERENCES) => {
        const prevEnabled = Array.isArray(prev.enabledModelIds)
          ? prev.enabledModelIds
          : DEFAULT_ENABLED_MODEL_IDS;
        const nextEnabled = enabled
          ? Array.from(new Set([...prevEnabled, modelId]))
          : prevEnabled.filter((id) => id !== modelId);

        return {
          ...prev,
          enabledModelIds: nextEnabled,
        };
      });
    },
    [setModelPreferences]
  );

  const removeCustomModel = useCallback(
    (modelId) => {
      if (!modelId) {
        return;
      }

      setModelPreferences((prev = DEFAULT_MODEL_PREFERENCES) => {
        const previousCustoms = prev.customModels ?? [];
        const nextCustoms = previousCustoms.filter((model) => model.id !== modelId);
        const previousEnabled = Array.isArray(prev.enabledModelIds)
          ? prev.enabledModelIds
          : DEFAULT_ENABLED_MODEL_IDS;
        const nextEnabled = previousEnabled.filter((id) => id !== modelId);

        return {
          ...prev,
          customModels: nextCustoms,
          enabledModelIds: nextEnabled,
        };
      });

      setSelectedModelId((current) => {
        if (current !== modelId) {
          return current;
        }

        const remainingModels = availableModels.filter(
          (model) => model.id !== modelId
        );
        const nextEnabledModels = remainingModels.filter((model) =>
          (modelPreferences?.enabledModelIds ?? DEFAULT_ENABLED_MODEL_IDS).includes(
            model.id
          )
        );

        if (nextEnabledModels.length > 0) {
          return nextEnabledModels[0].id;
        }

        return remainingModels[0]?.id ?? MODELS[0].id;
      });
    },
    [setModelPreferences, availableModels, modelPreferences, setSelectedModelId]
  );

  const addCustomModel = useCallback(
    (modelDefinition) => {
      if (!modelDefinition?.id) {
        return;
      }

      const newModel = {
        ...modelDefinition,
        id: modelDefinition.id.trim(),
        name: modelDefinition.name.trim(),
      };

      if (!newModel.id || !newModel.name) {
        return;
      }

      setModelPreferences((prev = DEFAULT_MODEL_PREFERENCES) => {
        const prevCustoms = prev.customModels ?? [];
        const withoutDuplicate = prevCustoms.filter(
          (model) => model.id !== newModel.id
        );
        const updatedCustoms = [...withoutDuplicate, newModel];
        const prevEnabled = Array.isArray(prev.enabledModelIds)
          ? prev.enabledModelIds
          : DEFAULT_ENABLED_MODEL_IDS;
        const nextEnabled = Array.from(
          new Set([...prevEnabled, newModel.id])
        );

        return {
          ...prev,
          customModels: updatedCustoms,
          enabledModelIds: nextEnabled,
        };
      });
    },
    [setModelPreferences]
  );

  return {
    selectedModel,
    selectedModelId,
    modelOptions,
    enabledModelIds,
    customModels,
    modelPreferences,
    isModelLoading,
    changeModel,
    toggleModelAvailability,
    removeCustomModel,
    addCustomModel,
    setSelectedModelId,
    setModelPreferences,
    availableModels,
  };
}
