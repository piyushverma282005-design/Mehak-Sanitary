export type ProductCategory =
  | 'health-faucets'
  | 'waste-couplings'
  | 'floor-jali'
  | 'sink-couplings'
  | 'jet-sprays'
  | 'waste-pipes'
  | 'bathroom-accessories'
  | 'other-sanitary-hardware';

export interface Category {
  id: ProductCategory;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl?: string | null;
  featured: boolean;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  categoryName: string;
  shortDescription: string;
  description: string;
  material?: string;
  image?: string | null;
  gallery?: string[];
  specifications?: ProductSpecification[];
  isFeatured?: boolean;
  featured?: boolean;
  available?: boolean;
}

export interface BusinessFeature {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export type BusinessType =
  | 'retailer'
  | 'dealer'
  | 'distributor'
  | 'contractor'
  | 'bulk-buyer'
  | 'other';

export interface ContactInfo {
  phoneNumbers: string[];
  whatsapp: string;
  whatsappUrl: string;
  email: string;
  gmailUrl?: string;
  address: string;
  whatsappMessage: string;
}

export interface CompanyInfo {
  name: string;
  brand: string;
  slogan: string;
  shortAbout: string;
  fullAbout: string;
  targetCustomers: string[];
  contact: ContactInfo;
}

export interface EnquiryFormData {
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  customerType: BusinessType;
  categoryInterest?: string;
  productName?: string;
  quantity?: string;
  message: string;
}

export interface DealerEnquiryFormData {
  name: string;
  phone: string;
  city: string;
  businessType: BusinessType;
  message: string;
  shopName?: string;
  email?: string;
  interestedProducts?: string[];
  quantity?: string;
}
