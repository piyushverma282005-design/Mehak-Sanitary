import { z } from 'zod';

const safeUrlSchema = z
  .string()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must use safe http:// or https:// protocol' }
  )
  .nullable()
  .optional()
  .or(z.literal(''));

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters long'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

export const publicEnquirySchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  city: z.string().optional(),
  companyName: z.string().optional(),
  businessType: z.string().optional(),
  enquiryType: z.string().optional(),
  product: z.string().optional(),
  quantity: z.string().optional(),
  message: z.string().min(1, 'Please provide enquiry details'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  shortDescription: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  material: z.string().optional(),
  featured: z.boolean().default(false),
  available: z.boolean().default(true),
  image: z.string().nullable().optional(),
  gallery: z.array(z.string()).default([]),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']),
});

export const businessSettingsSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  brand: z.string().min(1, 'Brand name is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  description: z.string().min(1, 'Description is required'),
  phonePrimary: z.string().min(8, 'Valid primary phone number is required'),
  phoneSecondary: z.string().nullable().optional(),
  phoneTertiary: z.string().nullable().optional(),
  whatsapp: z.string().min(8, 'Valid WhatsApp number is required'),
  email: z.string().email('Please enter a valid email address'),
  emailSecondary: z
    .string()
    .email('Please enter a valid secondary email address')
    .nullable()
    .optional()
    .or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  country: z.string().min(1, 'Country is required'),
  googleMapsUrl: safeUrlSchema,
  mapEmbedUrl: safeUrlSchema,
  instagramUrl: safeUrlSchema,
  facebookUrl: safeUrlSchema,
  youtubeUrl: safeUrlSchema,
});
