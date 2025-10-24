import { useState, useEffect } from 'react';

export const useStorage = (key, defaultValue) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    chrome.storage.sync.get([key], (result) => {
      if (result[key] !== undefined) {
        setValue(result[key]);
      }
    });
  }, [key]);

  const setStoredValue = (newValue) => {
    setValue(newValue);
    chrome.storage.sync.set({ [key]: newValue });
  };

  return [value, setStoredValue];
};