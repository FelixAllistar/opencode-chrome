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

  const setStoredValue = (newValue) => {
    setValue(newValue);
    chrome.storage.sync.set({ [key]: newValue });
  };

  return [value, setStoredValue, isLoading];
};