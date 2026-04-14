# Drizzle Migrations

## Baseline

Migration `0000_*.sql` — baseline, отражающий схему существующей продовой таблицы `submissions` в Turso. **Не применяйте её к уже существующей БД** — таблица уже создана. Файл нужен:

1. Для воспроизводимого первичного развёртывания в новое окружение.
2. Как отправная точка для будущих `drizzle-kit generate` (diff от неё).

## Воркфлоу будущих изменений схемы

1. Меняем `src/db/schema.ts`.
2. `npm run db:generate` — создастся `drizzle/0001_*.sql`.
3. Ревьюим SQL.
4. Применяем в staging / prod (через `npm run db:migrate` или Turso shell).

## Принудительная синхронизация baseline с prod Turso (только один раз)

Если Drizzle впервые применяется к Turso, нужно вручную пометить 0000 как применённую:

```sql
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
  id INTEGER PRIMARY KEY,
  hash TEXT NOT NULL,
  created_at INTEGER
);
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('<hash из drizzle/meta/_journal.json>', <unix_ms>);
```
