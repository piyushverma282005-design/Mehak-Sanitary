import { useState, useEffect } from 'react';
import { BusinessSettingsData, defaultSettings } from '@/lib/settings';

export function useBusinessSettings(): BusinessSettingsData {
  const [settings, setSettings] = useState<BusinessSettingsData>(defaultSettings);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.brand) {
          setSettings(data);
        }
      })
      .catch((err) => console.error('Error fetching settings hook:', err));
  }, []);

  return settings;
}
