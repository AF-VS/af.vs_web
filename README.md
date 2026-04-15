<div align="center">
  <h3>AF Venture Studio — Web</h3>
  <p>Маркетинговый лендинг студии AF Venture Studio</p>
  <p>
    <img src="https://img.shields.io/badge/Astro-5.0-FF5D01.svg" alt="Astro 5">
    <img src="https://img.shields.io/badge/TypeScript-strict-3178C6.svg" alt="TypeScript strict">
    <img src="https://img.shields.io/badge/Styles-CSS%20Modules-1572B6.svg" alt="CSS Modules">
    <img src="https://img.shields.io/badge/Node-22-339933.svg" alt="Node 22">
  </p>
  <p>
    <img src="https://img.shields.io/badge/Deploy-Vercel-000000.svg" alt="Vercel">
    <img src="https://img.shields.io/badge/DB-Drizzle%20%2B%20libSQL-C5F74F.svg" alt="Drizzle + libSQL">
    <img src="https://img.shields.io/badge/RateLimit-Upstash%20Redis-00E9A3.svg" alt="Upstash Redis">
    <img src="https://img.shields.io/badge/i18n-en%20%2F%20ru%20%2F%20uz-4B8BBE.svg" alt="i18n">
  </p>
</div>

---

<div align="left">
  <h3>О проекте</h3>
  <p>
    <b>AF Venture Studio</b> — сайт-визитка венчурной студии: hero, услуги, кейсы, контактная форма. Проект построен как <b>server-rendered Astro 5</b> на Vercel с тремя локалями (<code>en</code> — по умолчанию, <code>ru</code>, <code>uz</code>). Визуал — 1:1 с <a href="https://www.figma.com/design/L3skuk3D54hgX93qX7EIjd/AF.VS---web?node-id=277-734">Figma-макетом</a>, токены дизайна описаны в <a href="./DESIGN.md"><code>DESIGN.md</code></a>.
  </p>
  <p>
    Стек выбран намеренно «тонким»: никаких React/Tailwind/CSS-in-JS — только Astro-компоненты, CSS Modules и CSS-переменные из <code>src/styles/tokens.css</code>. JS на клиенте — минимум (smooth-scroll, валидация формы).
  </p>

  <hr>

  <h3>Стек</h3>
  <ul>
    <li><b>Astro 5</b> (<code>output: 'server'</code>) + адаптер <code>@astrojs/vercel</code></li>
    <li><b>TypeScript strict</b>, <code>any</code> запрещён</li>
    <li><b>CSS Modules</b> + токены через <code>:root</code> в <code>src/styles/tokens.css</code></li>
    <li><b>Fontsource</b>: Inter + Space Grotesk (самохостинг, без CDN)</li>
    <li><b>Drizzle ORM</b> + <b>libSQL</b> (<code>@libsql/client</code>) — хранение заявок</li>
    <li><b>Upstash Redis</b> — rate-limit контактной формы</li>
    <li><b>Zod</b> — валидация полей формы</li>
    <li><b>Telegram Bot API</b> — уведомления о новых заявках</li>
    <li><b>Vercel Analytics</b> + <b>Speed Insights</b></li>
    <li><b>@astrojs/sitemap</b> — генерация sitemap с i18n</li>
  </ul>

  <h3>Как это работает</h3>
  <ul>
    <li>
      <b>Рендеринг.</b> Все страницы рендерятся на Vercel Functions (<code>output: 'server'</code>). Статические ассеты — из <code>public/</code> и <code>src/assets/</code> через <code>astro:assets</code>.
    </li>
    <li>
      <b>i18n.</b> Локали объявлены в <code>astro.config.mjs</code>. Словари — в <code>src/i18n/{en,ru,uz}.ts</code>. Дефолтная локаль (<code>en</code>) без префикса, остальные — <code>/ru</code>, <code>/uz</code>. SEO-тайтлы/описания/OG собираются через <code>src/lib/seoMeta.ts</code> из <code>dict.seo.*</code>.
    </li>
    <li>
      <b>SEO.</b> Канонический origin — <code>https://afvs.dev</code> (одно место в <code>astro.config.mjs</code>). JSON-LD строится только через хелперы <code>src/lib/schema.ts</code> (<code>organizationSchema</code>, <code>websiteSchema</code>, …). Sitemap с hreflang — автогенерация от <code>@astrojs/sitemap</code>. Превью-домены <code>*.vercel.app</code> отдают <code>noindex</code>.
    </li>
    <li>
      <b>Контактная форма.</b> POST на <code>src/pages/api/contact.ts</code>:
      <ol>
        <li>Zod-валидация (<code>src/lib/contactSchema.ts</code>).</li>
        <li>Rate-limit по IP через Upstash (<code>src/lib/rateLimit.ts</code>).</li>
        <li>Запись заявки в libSQL через Drizzle (<code>src/db/</code>).</li>
        <li>Уведомление в Telegram (<code>src/lib/telegram.ts</code>).</li>
      </ol>
    </li>
    <li>
      <b>Дизайн-токены.</b> Цвета, шрифты, радиусы, брейкпоинты — только через CSS-переменные. Хардкод hex в компонентах запрещён.
    </li>
  </ul>

  <h3>Структура</h3>
  <pre>
  af.vs_web/
  ├── src/
  │   ├── pages/           # Маршруты Astro (index + ru/ + uz/ + api/)
  │   │   └── api/
  │   │       └── contact.ts   # POST-хендлер формы
  │   ├── components/      # .astro-компоненты по секциям
  │   │   ├── hero/
  │   │   ├── services/
  │   │   ├── cases/
  │   │   ├── form/
  │   │   ├── layout/
  │   │   ├── chrome/
  │   │   └── ui/
  │   ├── i18n/            # Словари en/ru/uz
  │   ├── lib/             # seoMeta, schema, site, rateLimit, telegram…
  │   ├── db/              # Drizzle client + schema
  │   ├── styles/          # tokens.css + глобальные стили
  │   └── assets/          # Изображения (astro:assets)
  ├── drizzle/             # Миграции БД
  ├── public/              # Статика (robots.txt, llms.txt, og и т.д.)
  ├── astro.config.mjs     # site, adapter, i18n, sitemap
  ├── drizzle.config.ts
  ├── vercel.json
  ├── DESIGN.md            # Токены, секции, node IDs, копирайт
  └── CLAUDE.md            # Конвенции для AI-ассистента
  </pre>

  <h3>Разработка</h3>
  <pre>
  # Node 22
  npm install
  npm run dev           # astro dev на http://localhost:4321
  npm run check         # astro check (типы + диагностика)
  npm run build         # сборка под Vercel
  npm run preview       # локальный просмотр прод-сборки

# База

npm run db:generate # drizzle-kit generate
npm run db:migrate # drizzle-kit migrate

  </pre>

  <h3>Деплой</h3>
  <p>
    Продакшен — <b>Vercel</b>, адаптер <code>@astrojs/vercel</code>. Каждый push в <code>master</code> создаёт production-деплой, PR — preview. Превью-домены отдают <code>noindex</code>, чтобы не попадать в индекс. Канонический домен — <b><a href="https://afvs.dev">afvs.dev</a></b>.
  </p>
  <pre>
  vercel link           # привязать локальную папку к проекту
  vercel env pull       # подтянуть переменные окружения
  vercel deploy         # preview-деплой
  vercel deploy --prod  # production
  </pre>

  <h3>Конвенции</h3>
  <ul>
    <li>Визуал — <b>Figma single source of truth</b>. Расхождения с ТЗ — уточнять у продакта, не править молча.</li>
    <li>Все видимые тексты — из словарей <code>src/i18n/*</code>, а не из разметки.</li>
    <li>Цвета/шрифты/радиусы — только через CSS-переменные из <code>tokens.css</code>.</li>
    <li>Компоненты — <code>PascalCase.astro</code>, стили — scoped <code>&lt;style&gt;</code> или <code>*.module.css</code> рядом.</li>
    <li>Mobile-first CSS, брейкпоинты через <code>min-width</code>.</li>
    <li>Подробности и чек-листы для AI-ассистента — в <a href="./CLAUDE.md"><code>CLAUDE.md</code></a>.</li>
  </ul>
</div>
