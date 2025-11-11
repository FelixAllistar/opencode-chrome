import { useEffect } from 'react';
import { setBraveSearchSubscriptionToken } from '@/services/ai/tools/braveSearchTool';
import { setContext7ApiKey as registerContext7ApiKey } from '@/services/ai/tools/context7Tool';

export function useProviderRegistrations({
  braveSearchApiKey,
  context7ApiKey,
}) {
  useEffect(() => {
    setBraveSearchSubscriptionToken(braveSearchApiKey);
  }, [braveSearchApiKey]);

  useEffect(() => {
    registerContext7ApiKey(context7ApiKey);
  }, [context7ApiKey]);
}
