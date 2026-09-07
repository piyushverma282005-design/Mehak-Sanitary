import { prisma } from '@/lib/prisma';
import { companyData } from '@/data/company';

export interface BusinessSettingsData {
  name: string;
  brand: string;
  tagline: string;
  description: string;
  phonePrimary: string;
  phoneSecondary: string | null;
  phoneTertiary: string | null;
  whatsapp: string;
  email: string;
  emailSecondary: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  googleMapsUrl: string | null;
  mapEmbedUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
}

export const defaultSettings: BusinessSettingsData = {
  name: companyData.name,
  brand: companyData.brand,
  tagline: companyData.slogan,
  description: companyData.fullAbout,
  phonePrimary: companyData.contact.phoneNumbers[0] || '8307721917',
  phoneSecondary: companyData.contact.phoneNumbers[1] || '9354222883',
  phoneTertiary: companyData.contact.phoneNumbers[2] || '9518405643',
  whatsapp: companyData.contact.whatsapp || '8307721917',
  email: companyData.contact.email || 'piyushverma282005@gmail.com',
  emailSecondary: null,
  address: 'Plot No. 12, Industrial Area, Sector 5',
  city: 'Faridabad',
  state: 'Haryana',
  pincode: '121006',
  country: 'India',
  googleMapsUrl: 'https://maps.google.com',
  mapEmbedUrl: null,
  instagramUrl: null,
  facebookUrl: null,
  youtubeUrl: null,
};

import { unstable_cache } from 'next/cache';

async function fetchBusinessSettingsFromDb(): Promise<BusinessSettingsData> {
  try {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: 'global' },
    });

    if (settings) {
      return {
        name: settings.name,
        brand: settings.brand,
        tagline: settings.tagline,
        description: settings.description,
        phonePrimary: settings.phonePrimary,
        phoneSecondary: settings.phoneSecondary,
        phoneTertiary: settings.phoneTertiary,
        whatsapp: settings.whatsapp,
        email: settings.email,
        emailSecondary: settings.emailSecondary,
        address: settings.address,
        city: settings.city,
        state: settings.state,
        pincode: settings.pincode,
        country: settings.country,
        googleMapsUrl: settings.googleMapsUrl,
        mapEmbedUrl: settings.mapEmbedUrl,
        instagramUrl: settings.instagramUrl,
        facebookUrl: settings.facebookUrl,
        youtubeUrl: settings.youtubeUrl,
      };
    }
  } catch (error) {
    console.error('Error fetching BusinessSettings from DB:', error);
  }

  return defaultSettings;
}

export const getBusinessSettings = unstable_cache(
  fetchBusinessSettingsFromDb,
  ['business-settings-global'],
  {
    revalidate: 300,
    tags: ['settings'],
  }
);
