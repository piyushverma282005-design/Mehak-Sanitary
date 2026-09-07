export interface AdminUser {
  id: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    products: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryName?: string;
  categoryId: string;
  shortDescription?: string;
  description: string;
  material?: string;
  featured: boolean;
  isFeatured?: boolean;
  available: boolean;
  image?: string | null;
  gallery?: string[];
  specifications?: ProductSpecification[];
  createdAt?: string;
  updatedAt?: string;
}

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  companyName?: string | null;
  businessType?: string | null;
  enquiryType?: string | null;
  product?: string | null;
  quantity?: string | null;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessSettings {
  id: string;
  name: string;
  brand: string;
  tagline: string;
  description: string;
  phonePrimary: string;
  phoneSecondary?: string | null;
  phoneTertiary?: string | null;
  whatsapp: string;
  email: string;
  emailSecondary?: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  googleMapsUrl?: string | null;
  mapEmbedUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
}
