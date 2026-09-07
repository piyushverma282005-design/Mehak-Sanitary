'use client';

import React, { createContext, useContext } from 'react';
import { BusinessSettingsData, defaultSettings } from '@/lib/settings';

const SettingsContext = createContext<BusinessSettingsData>(defaultSettings);

export interface SettingsProviderProps {
  children: React.ReactNode;
  settings: BusinessSettingsData;
}

export function SettingsProvider({ children, settings }: SettingsProviderProps) {
  return (
    <SettingsContext.Provider value={settings || defaultSettings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useBusinessSettings(): BusinessSettingsData {
  const context = useContext(SettingsContext);
  return context || defaultSettings;
}
