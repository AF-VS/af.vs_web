import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const submissions = sqliteTable(
  'submissions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productType: text('product_type').notNull(),
    readinessStage: text('readiness_stage').notNull(),
    platform: text('platform').notNull(),
    industry: text('industry').notNull(),
    name: text('name').notNull(),
    projectName: text('project_name'),
    email: text('email').notNull(),
    phone: text('phone'),
    // kept as text for compatibility with existing Turso rows (ISO 8601)
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    index('submissions_created_at_idx').on(t.createdAt),
    index('submissions_email_idx').on(t.email),
  ],
);

export type Submission = typeof submissions.$inferInsert;
