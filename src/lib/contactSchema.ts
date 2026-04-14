import { z } from 'zod';

export const PRODUCT_TYPES = ['MVP', 'Complex solution', 'Enterprise software', 'Audit & Refactoring',
  'Сложное решение', 'Корпоративное ПО', 'Аудит и рефакторинг',
  'Murakkab yechim', 'Korporativ dastur', 'Audit va refaktoring'] as const;

export const contactSchema = z.object({
  productType: z.string().min(1).max(80),
  readinessStage: z.string().min(1).max(80),
  platform: z.string().min(1).max(80),
  industry: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  projectName: z.string().trim().max(120).optional().default(''),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(32).optional().default(''),
  // Antibot fields — см. Task 4
  website: z.string().max(0).optional().default(''),
  startedAt: z.number().int().positive(),
});

export type ContactInput = z.infer<typeof contactSchema>;
