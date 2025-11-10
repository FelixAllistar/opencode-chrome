import { useState, useEffect } from 'react';

export const useStorage = (key, defaultValue) => {
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chrome.storage.sync.get([key], (result) => {
      if (result[key] !== undefined) {
        setValue(result[key]);
      }
      setIsLoading(false);
    });
  }, [key]);

  const setStoredValue = (newValueOrUpdater) => {
    setValue((previousValue) => {
      const resolvedValue =
        typeof newValueOrUpdater === 'function'
          ? newValueOrUpdater(previousValue)
          : newValueOrUpdater;

      chrome.storage.sync.set({ [key]: resolvedValue });
      return resolvedValue;
    });
  };

  return [value, setStoredValue, isLoading];
};
