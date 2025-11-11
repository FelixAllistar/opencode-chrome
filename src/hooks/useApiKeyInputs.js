import { useCallback, useEffect, useState } from 'react';

const EMPTY_VALUES = {
  apiKey: '',
  googleApiKey: '',
  braveSearchApiKey: '',
  context7ApiKey: '',
  openRouterApiKey: '',
};

export function useApiKeyInputs({
  apiKey = '',
  googleApiKey = '',
  braveSearchApiKey = '',
  context7ApiKey = '',
  openRouterApiKey = '',
}) {
  const [inputs, setInputs] = useState({
    ...EMPTY_VALUES,
    apiKey,
    googleApiKey,
    braveSearchApiKey,
    context7ApiKey,
    openRouterApiKey,
  });

  useEffect(() => {
    const normalizedValues = {
      apiKey,
      googleApiKey,
      braveSearchApiKey,
      context7ApiKey,
      openRouterApiKey,
    };

    setInputs((previous) => {
      const hasChanges = Object.keys(normalizedValues).some(
        (key) => previous[key] !== normalizedValues[key]
      );

      return hasChanges ? { ...previous, ...normalizedValues } : previous;
    });
  }, [apiKey, googleApiKey, braveSearchApiKey, context7ApiKey, openRouterApiKey]);

  const updateInput = useCallback((key, value) => {
    setInputs((previous) => {
      if (previous[key] === value) {
        return previous;
      }

      return {
        ...previous,
        [key]: value,
      };
    });
  }, []);

  const setInputsState = useCallback((nextValues) => {
    setInputs((previous) => {
      const merged = {
        ...previous,
        ...nextValues,
      };

      const hasChanges = Object.keys(nextValues).some(
        (key) => merged[key] !== previous[key]
      );

      return hasChanges ? merged : previous;
    });
  }, []);

  const resetInputs = useCallback(() => {
    setInputs({
      ...EMPTY_VALUES,
      apiKey,
      googleApiKey,
      braveSearchApiKey,
      context7ApiKey,
      openRouterApiKey,
    });
  }, [apiKey, googleApiKey, braveSearchApiKey, context7ApiKey, openRouterApiKey]);

  return {
    inputs,
    updateInput,
    setInputsState,
    resetInputs,
  };
}
