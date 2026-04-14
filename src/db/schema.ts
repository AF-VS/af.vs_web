import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productType: text('product_type').notNull(),
  readinessStage: text('readiness_stage').notNull(),
  platform: text('platform').notNull(),
  industry: text('industry').notNull(),
  name: text('name').notNull(),
  projectName: text('project_name'),
  email: text('email').notNull(),
  phone: text('phone'),
  createdAt: text('created_at').notNull(),
});

export type Submission = typeof submissions.$inferInsert;
