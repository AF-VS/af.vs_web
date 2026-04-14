# Phase 1 — Cleanup & Dead Code Removal

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Убрать мёртвый код, неиспользуемые файлы и мусор в репо перед всеми остальными фазами.

**Architecture:** Без рефакторинга. Только удаление — мёртвых модулей, неиспользуемых ассетов, дубликатов в конфиге, `.DS_Store` из рабочего дерева и лишних devDependencies.

**Tech Stack:** Astro 5, TypeScript, npm.

**Covered audit findings:** #1 (dead db/lib modules), #5 (tsconfig.server.json), #18 (unused AnimatedContent + picture.jpeg), #25 (duplicate `.vercel` in .gitignore), #32 (.DS_Store), partially #14 (unused devDeps — `@vercel/node`, `playwright` если нет тестов).

---

### Task 1: Определить и удалить мёртвые серверные модули

Аудит показал: `src/pages/api/contact.ts` переобъявляет схему, клиент БД и Telegram-функции, игнорируя существующие `src/db/client.ts`, `src/db/schema.ts`, `src/lib/telegram.ts`. В этом плане — удаляем дубликаты. **Реинтеграция с использованием общих модулей произойдёт в Phase 2** (там же примем окончательное решение — оставить Drizzle или убрать).

**Files:**
- Verify: `src/db/client.ts`, `src/db/schema.ts`, `src/lib/telegram.ts` — подтвердить 0 импортов
- Delete: `src/db/client.ts`, `src/db/schema.ts`, `src/lib/telegram.ts`
- Delete (если пуста): `src/db/`, `src/lib/` (если `paths.ts` и `contact.ts` и `smoothScroll.ts` остаются — не удалять `src/lib/`)

- [ ] **Step 1: Подтвердить отсутствие импортов перед удалением**

Run:
```bash
grep -rn "from.*['\"].*lib/telegram['\"]" src/ || echo "NO_IMPORTS"
grep -rn "from.*['\"].*db/client['\"]" src/ || echo "NO_IMPORTS"
grep -rn "from.*['\"].*db/schema['\"]" src/ || echo "NO_IMPORTS"
```
Expected: каждая команда выводит `NO_IMPORTS`. Если хоть одна нашла импорт — остановиться и согласовать с пользователем.

- [ ] **Step 2: Удалить мёртвые файлы**

Run:
```bash
rm src/db/client.ts src/db/schema.ts src/lib/telegram.ts
rmdir src/db 2>/dev/null || true
```

- [ ] **Step 3: Проверить сборку**

Run: `npm run check && npm run build`
Expected: `0 errors, 0 warnings, 0 hints` и успешный build.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove dead db/lib modules superseded by inline API handler"
```

---

### Task 2: Удалить `tsconfig.server.json`

Конфиг ссылается на несуществующую папку `api/**/*` и на только что удалённый `src/lib/telegram.ts`, не используется ни одним npm-скриптом.

**Files:**
- Delete: `tsconfig.server.json`

- [ ] **Step 1: Подтвердить, что конфиг не упоминается**

Run:
```bash
grep -rn "tsconfig.server" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist || echo "NO_REFS"
```
Expected: `NO_REFS`.

- [ ] **Step 2: Удалить файл**

Run: `rm tsconfig.server.json`

- [ ] **Step 3: Проверить typecheck**

Run: `npm run check`
Expected: `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused tsconfig.server.json"
```

---

### Task 3: Удалить неиспользуемый компонент `AnimatedContent.astro`

grep подтверждает 0 импортов. Reveal-логика живёт через прямые `data-animate` атрибуты + глобальный скрипт в Layout.astro.

**Files:**
- Delete: `src/components/ui/AnimatedContent.astro`

- [ ] **Step 1: Подтвердить 0 импортов**

Run:
```bash
grep -rn "AnimatedContent" src/ || echo "UNUSED"
```
Expected: `UNUSED`.

- [ ] **Step 2: Удалить файл**

Run: `rm src/components/ui/AnimatedContent.astro`

- [ ] **Step 3: Проверить сборку**

Run: `npm run check && npm run build`
Expected: зелёный build.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused AnimatedContent wrapper component"
```

---

### Task 4: Удалить неиспользуемый ассет `picture.jpeg`

Файл `src/assets/brif/picture.jpeg` (208 KB) не импортируется нигде.

**Files:**
- Delete: `src/assets/brif/picture.jpeg`

- [ ] **Step 1: Подтвердить 0 ссылок**

Run:
```bash
grep -rn "picture\.jpeg\|picture\.jpg" src/ public/ || echo "UNUSED"
```
Expected: `UNUSED`.

- [ ] **Step 2: Удалить ассет**

Run: `rm src/assets/brif/picture.jpeg`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove unused brif/picture.jpeg asset (208 KB)"
```

---

### Task 5: Почистить `.gitignore` от дубликата

В `.gitignore` дважды упомянут `.vercel` (строки 2 и 26 в текущем виде — `.vercel/` и `.vercel`). Оставить одну строку `.vercel/`.

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Прочитать текущий файл**

Run: `cat .gitignore`

- [ ] **Step 2: Удалить одинокую строку `.vercel`**

Edit: `.gitignore` — найти и удалить строку `.vercel` (без слэша), оставить только `.vercel/`.

Ожидаемое содержимое после:
```
# build output
dist/
.vercel/
.astro/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production
.env.local

# macOS
.DS_Store

# editors
.vscode/
.idea/
```

- [ ] **Step 3: Убедиться, что `.vercel` встречается ровно один раз**

Run: `grep -c "^\.vercel" .gitignore`
Expected: `1`.

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore(gitignore): remove duplicate .vercel entry"
```

---

### Task 6: Почистить `.DS_Store` из рабочего дерева

Файлы уже игнорируются git'ом, но физически лежат в `src/` и подпапках. Для чистоты локального дерева — удалить.

**Files:**
- Delete (физически, не из git): все `.DS_Store` в `src/` и `public/`

- [ ] **Step 1: Посмотреть какие .DS_Store есть**

Run: `find src public -name .DS_Store -print`
Ожидается список из 4-5 файлов.

- [ ] **Step 2: Удалить их**

Run: `find src public -name .DS_Store -delete`

- [ ] **Step 3: Проверить git status**

Run: `git status`
Expected: `nothing to commit, working tree clean` (т.к. `.DS_Store` в `.gitignore` — git их не отслеживал).

- [ ] **Step 4: Коммит не требуется**

Шаг пропускается — удаление нетрекаемых файлов не создаёт изменений в индексе.

---

### Task 7: Удалить лишние devDependencies

Аудит: `@vercel/node` не используется (API handler — Astro APIRoute, не Vercel handler-стиль). `playwright` не используется (нет тестов). `vercel` CLI есть в devDeps и ставится глобально в CI → дубликат. **Drizzle-kit оставляем пока** — решение о его судьбе принимается в Phase 2.

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Убедиться, что `@vercel/node` реально не используется**

Run:
```bash
grep -rn "@vercel/node" src/ api/ 2>/dev/null || echo "UNUSED"
```
Expected: `UNUSED`.

- [ ] **Step 2: Убедиться, что playwright не используется**

Run:
```bash
grep -rn "from ['\"]playwright" . --include="*.ts" --include="*.js" --include="*.mjs" --exclude-dir=node_modules --exclude-dir=dist || echo "UNUSED"
ls tests/ e2e/ 2>/dev/null || echo "NO_TESTS"
```
Expected: `UNUSED` и `NO_TESTS`.

- [ ] **Step 3: Удалить пакеты**

Run:
```bash
npm uninstall @vercel/node playwright vercel
```

- [ ] **Step 4: Проверить, что сборка всё ещё зелёная**

Run: `npm run check && npm run build`
Expected: успех.

- [ ] **Step 5: Проверить CI-файл**

Open: `.github/workflows/deploy.yml` — убедиться, что `npm i -g vercel` остаётся. Если нет — остановиться и согласовать.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): drop unused @vercel/node, playwright, local vercel CLI"
```

---

### Task 8: Финальная верификация фазы

- [ ] **Step 1: Полный билд и typecheck**

Run: `npm run check && npm run build`
Expected: зелёный build, `mode: "server"`.

- [ ] **Step 2: Проверить размер node_modules (информативно)**

Run: `du -sh node_modules`
Expected: заметно меньше, чем до Phase 1 (примерно –50 MB за счёт vercel CLI и playwright browsers).

- [ ] **Step 3: Убедиться в чистоте git tree**

Run: `git status`
Expected: `nothing to commit, working tree clean`.

---

## Coverage check

| Audit # | Task | Status |
|---------|------|--------|
| #1 (dead db/lib duplication) | Task 1 | ✅ |
| #5 (tsconfig.server.json) | Task 2 | ✅ |
| #18 (AnimatedContent + picture.jpeg) | Tasks 3, 4 | ✅ |
| #25 (duplicate `.vercel`) | Task 5 | ✅ |
| #32 (.DS_Store local cleanup) | Task 6 | ✅ |
| #14 partial (unused devDeps) | Task 7 | ✅ |

Остаток #14 (решение про `drizzle-kit`) — в Phase 2.
