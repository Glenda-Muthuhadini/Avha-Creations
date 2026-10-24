import { createContext, useContext } from 'react';
import { BUSINESS, enquiryUrl } from '../config/business';
import { getPublicSettings } from '../services/settings';
import { isSupabaseConfigured } from '../lib/supabase';
import { useResource } from '../hooks/useResource';

const BusinessContext = createContext(null);
export function BusinessProvider({ children }) {
  const resource = useResource(getPublicSettings, isSupabaseConfigured);
  const settings = { ...BUSINESS, ...Object.fromEntries(Object.entries(resource.data || {}).filter(([, value]) => value !== null && value !== '')) };
  return <BusinessContext.Provider value={{ ...resource, settings, whatsappUrl: enquiryUrl(settings.whatsapp_number) }}>{children}</BusinessContext.Provider>;
}
export const useBusiness = () => useContext(BusinessContext);
