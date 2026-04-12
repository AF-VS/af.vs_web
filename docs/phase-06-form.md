# Phase 6: Contact Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать контактную форму (name/email/message) с клиентской валидацией и абстракцией `sendContact()`. Реальный канал доставки (Telegram/Resend) — отдельное решение после плана; сейчас форма логирует payload и показывает сообщение «отправка не настроена».

**Depends on:** [`phase-05-cases.md`](./phase-05-cases.md)

**Spec:** [`superpowers/specs/2026-04-09-afvs-landing-design.md`](./superpowers/specs/2026-04-09-afvs-landing-design.md)

**Figma nodes:**
- Form section: `285:1080`

**Architecture:** `src/lib/contact.ts` экспортирует `ContactPayload` и `sendContact()`. Сама функция бросает ошибку «provider not configured» — это **ожидаемое поведение в рамках плана**. `ContactForm.astro` использует нативную HTML5 валидацию (`required`, `type="email"`, `minlength`) плюс скрипт на submit: `preventDefault`, собрать `FormData`, вызвать `sendContact`, показать либо success, либо error state.

**Tech Stack:** Astro, vanilla DOM, HTML5 validation.

---

## File Structure

- Create: `src/lib/contact.ts`
- Create: `src/components/form/ContactForm.astro`
- Modify: `src/pages/index.astro` — добавить `<ContactForm>`
- Modify: `src/pages/ru/index.astro` — добавить `<ContactForm>`

## Tasks

### Task 6.1: Инвокнуть `ui-ux-pro-max` для Form

- [ ] **Step 1: Получить гайдлайны**

Инвокни `ui-ux-pro-max:ui-ux-pro-max` с контекстом: «contact form with name, email, message fields and a CTA submit button on a dark navy background; 1200×640 on desktop». Забери рекомендации по:
- inline validation vs submit-time validation (мы делаем submit-time + HTML5 pattern; подтверди)
- error messages: где показывать, цвет (нам нужен новый токен `--color-error` или переиспользуем `--primary-accent`?)
- loading state кнопки
- placeholder vs label (предпочтительно label + placeholder для accessibility)
- focus ring
- success state feedback

### Task 6.2: Получить дизайн

- [ ] **Step 1: get_design_context**

Run (MCP): `get_design_context(nodeId="285:1080", fileKey="L3skuk3D54hgX93qX7EIjd")`

- [ ] **Step 2: get_screenshot**

Run (MCP): `get_screenshot(nodeId="285:1080", fileKey="L3skuk3D54hgX93qX7EIjd")`

### Task 6.3: Создать `src/lib/contact.ts`

**Files:**
- Create: `src/lib/contact.ts`

- [ ] **Step 1: Написать файл**

```ts
export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

/**
 * Send a contact form payload.
 *
 * Status: provider not yet wired. Intentionally throws so UI can render an
 * "unconfigured" state. Choice of channel (Telegram / Resend / etc.) is
 * deferred to a decision after the implementation plan.
 *
 * When wiring a real provider, keep this signature (async, throws on failure,
 * resolves on success) so callers don't need to change.
 */
export async function sendContact(payload: ContactPayload): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[sendContact] payload', payload);
  throw new Error('sendContact: provider not configured');
}
```

### Task 6.4: Создать `src/components/form/ContactForm.astro`

**Files:**
- Create: `src/components/form/ContactForm.astro`

- [ ] **Step 1: Написать файл**

```astro
---
import type { Dict } from '../../i18n/en';
import Button from '../ui/Button.astro';

interface Props {
  dict: Dict;
}

const { dict } = Astro.props;
---

<section id="contact" class="form-section">
  <div class="container">
    <div class="form-card">
      <h2 class="form__title">{dict.form.title}</h2>

      <form class="form" data-contact-form novalidate>
        <label class="field">
          <span class="field__label">{dict.form.name}</span>
          <input type="text" name="name" required minlength="2" autocomplete="name" />
        </label>

        <label class="field">
          <span class="field__label">{dict.form.email}</span>
          <input type="email" name="email" required autocomplete="email" />
        </label>

        <label class="field field--full">
          <span class="field__label">{dict.form.message}</span>
          <textarea name="message" required minlength="10" rows="5"></textarea>
        </label>

        <div class="form__status" data-form-status aria-live="polite"></div>

        <div class="form__submit">
          <Button type="submit">{dict.form.submit}</Button>
        </div>
      </form>
    </div>
  </div>
</section>

<style>
  .form-section { padding-block: 96px; }

  .form-card {
    background-color: var(--surface-card);
    border: var(--card-border-width) solid var(--border-card);
    border-radius: var(--radius-card);
    padding: 48px 32px;
  }

  @media (min-width: 1248px) {
    .form-card { padding: 64px; }
  }

  .form__title {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: var(--font-size-h4);
    line-height: var(--line-height-h4);
    letter-spacing: var(--letter-spacing-h4);
    color: var(--text-primary);
    margin-bottom: 32px;
  }

  .form {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .form { grid-template-columns: 1fr 1fr; }
    .field--full { grid-column: 1 / -1; }
    .form__status,
    .form__submit { grid-column: 1 / -1; }
  }

  .field { display: flex; flex-direction: column; gap: 8px; }

  .field__label {
    font-size: var(--font-size-caption);
    font-weight: 500;
    color: var(--text-subtle);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .field input,
  .field textarea {
    font-family: var(--font-body);
    font-size: var(--font-size-body);
    color: var(--text-primary);
    background-color: transparent;
    border: 1px solid var(--text-secondary);
    border-radius: 16px;
    padding: 16px 20px;
    min-height: 56px;
    transition: border-color 0.15s ease;
  }

  .field input:focus,
  .field textarea:focus {
    border-color: var(--primary-accent);
    outline: none;
  }

  .field textarea {
    resize: vertical;
    min-height: 120px;
  }

  .form__status {
    min-height: 24px;
    font-size: var(--font-size-body);
    color: var(--text-subtle);
  }

  .form__status[data-state='error']   { color: var(--primary-accent); }
  .form__status[data-state='success'] { color: var(--primary-default); }

  .form__submit { margin-top: 8px; }
</style>

<script>
  import { sendContact } from '../../lib/contact';

  function initForms() {
    const forms = document.querySelectorAll<HTMLFormElement>('[data-contact-form]');
    forms.forEach((form) => {
      const status = form.querySelector<HTMLElement>('[data-form-status]');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const data = new FormData(form);
        const payload = {
          name: String(data.get('name') ?? ''),
          email: String(data.get('email') ?? ''),
          message: String(data.get('message') ?? ''),
        };

        if (status) {
          status.dataset.state = '';
          status.textContent = 'Sending...';
        }

        try {
          await sendContact(payload);
          if (status) {
            status.dataset.state = 'success';
            status.textContent = 'Sent.';
          }
          form.reset();
        } catch (_err) {
          if (status) {
            status.dataset.state = 'error';
            // Use localized error copy from the form dict; attribute is set per-page via data-unconfigured.
            status.textContent = form.dataset.errorUnconfigured ?? 'Form delivery not configured yet.';
          }
        }
      });
    });
  }

  document.addEventListener('astro:page-load', initForms);
  initForms();
</script>
```

- [ ] **Step 2: Передать локализованный текст ошибки через data-атрибут**

Обнови разметку формы — добавь `data-error-unconfigured={dict.form.errorUnconfigured}` на `<form>`:

```astro
<form class="form" data-contact-form data-error-unconfigured={dict.form.errorUnconfigured} novalidate>
```

### Task 6.5: Подключить Form к страницам

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/ru/index.astro`

- [ ] **Step 1: Импорт + компонент в `index.astro` после `<Cases>`**

```astro
import ContactForm from '../components/form/ContactForm.astro';
// ...
<Cases dict={en} />
<ContactForm dict={en} />
```

- [ ] **Step 2: Аналогично в `ru/index.astro`**

### Task 6.6: Проверка сборки и поведения

- [ ] **Step 1: Type-check + build**

Run: `npx astro check && npm run build`
Expected: 0 errors.

- [ ] **Step 2: Dev-сервер — ручная валидация формы**

Run: `npm run dev`
- Открой `/#contact` → видна форма.
- Нажми Submit пустой формы → браузер показывает native tooltip про required поле.
- Заполни name=«A» → попробуй submit → требует minlength 2.
- Заполни валидно → нажми Submit → увидишь `Sending...` → затем `Form delivery not configured yet.` (красно-синий `--primary-accent`).
- Открой DevTools Console → видно `[sendContact] payload {...}` с твоими данными.

- [ ] **Step 3: Figma-паритет**

Run (MCP): `get_screenshot(nodeId="285:1080", fileKey="L3skuk3D54hgX93qX7EIjd")`
Паритет ≥ 95% на 1440.

### Task 6.7: Коммит Фазы 6

- [ ] **Step 1: Stage и commit**

```bash
git add src/lib/contact.ts \
        src/components/form/ContactForm.astro \
        src/pages/index.astro src/pages/ru/index.astro
git commit -m "feat(phase-6): contact form — validation, sendContact abstraction"
```

## Acceptance (run before marking phase complete)

- [ ] `npx astro check` — 0 errors
- [ ] `npm run build` — без warnings
- [ ] Форма валидирует required/email/minlength
- [ ] Submit логирует payload в console и показывает «not configured» сообщение
- [ ] Keyboard: Tab проходит по полям и кнопке, focus visible
- [ ] Figma-паритет ≥ 95% с `get_screenshot(285:1080)`
- [ ] Grep hex вне `tokens.css` = 0
- [ ] Коммит Фазы 6 создан

## Next

→ [`phase-07-polish-deploy.md`](./phase-07-polish-deploy.md)
