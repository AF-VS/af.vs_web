import { track } from '@vercel/analytics';
import { scheduleBotIdInit } from './botid';
import { sendContact } from '../../../lib/contact';

export function initBrifWizard(): void {
  // Time-trap anchor — measures time from wizard-visible to submit.
  // Resets on astro:page-load (SPA nav); fine for this single-page lander.
  const startedAt = Date.now();

  const wizard = document.querySelector<HTMLDivElement>('[data-wizard]');
  if (!wizard) return;

  scheduleBotIdInit();

  let currentStep = 1;
  let previousStep = 1;
  const totalSteps = 6;
  const selections: Record<string, string> = {};

  const progressFill = wizard.querySelector<HTMLDivElement>('[data-progress-fill]');
  const btn = wizard.querySelector<HTMLButtonElement>('[data-brif-btn]');
  const btnBack = wizard.querySelector<HTMLButtonElement>('[data-brif-back]');
  const btnText = wizard.querySelector<HTMLSpanElement>('[data-btn-text]');
  const actions = wizard.querySelector<HTMLDivElement>('[data-actions]');
  const dots = wizard.querySelectorAll<HTMLDivElement>('[data-dot]');
  const steps = wizard.querySelectorAll<HTMLDivElement>('[data-step]');

  const errorTexts = {
    selectOption: wizard.dataset.errSelectOption || 'Please select an option',
    otherEmpty: wizard.dataset.errOtherEmpty || 'Please specify',
    name: wizard.dataset.errName || 'Enter your name',
    email: wizard.dataset.errEmail || 'Enter a valid email',
    phone: wizard.dataset.errPhone || 'Enter a valid phone number',
  };

  const fillPercents = [20, 42.7, 66.6, 87.3, 100];
  const ANIM_CLASSES = [
    'is-entering-fwd',
    'is-entering-back',
    'is-leaving-fwd',
    'is-leaving-back',
  ];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateUI(): void {
    // Direction: +1 forward, -1 back, 0 = no change (initial paint)
    const dir =
      currentStep > previousStep ? 1 : currentStep < previousStep ? -1 : 0;

    // Update steps visibility with direction-aware slide animation
    steps.forEach((s) => {
      const stepNum = parseInt(s.dataset.step || '0', 10);
      ANIM_CLASSES.forEach((c) => s.classList.remove(c));

      if (stepNum === currentStep) {
        s.classList.add('is-active');
        if (dir !== 0 && !prefersReducedMotion) {
          s.classList.add(dir > 0 ? 'is-entering-fwd' : 'is-entering-back');
        }
      } else if (
        stepNum === previousStep &&
        previousStep !== currentStep &&
        !prefersReducedMotion
      ) {
        s.classList.remove('is-active');
        s.classList.add(dir > 0 ? 'is-leaving-fwd' : 'is-leaving-back');
      } else {
        s.classList.remove('is-active');
      }
    });

    // Strip animation modifiers once the entering step finishes
    if (dir !== 0 && !prefersReducedMotion) {
      const entering = wizard!.querySelector<HTMLDivElement>(
        '[data-step].is-entering-fwd, [data-step].is-entering-back'
      );
      if (entering) {
        entering.addEventListener(
          'animationend',
          () => {
            steps.forEach((s) => {
              ANIM_CLASSES.forEach((c) => s.classList.remove(c));
            });
          },
          { once: true }
        );
      }
    }

    previousStep = currentStep;

    // Update progress fill + ARIA
    const progressEl = wizard!.querySelector<HTMLDivElement>('[data-progress]');
    if (progressEl) {
      progressEl.style.display = currentStep === 6 ? 'none' : '';
      const stepForAria = Math.min(currentStep, 5);
      progressEl.setAttribute('aria-valuenow', String(stepForAria));
      progressEl.setAttribute('aria-valuetext', `Step ${stepForAria} of 5`);
    }
    if (progressFill) {
      const idx = Math.min(currentStep - 1, fillPercents.length - 1);
      progressFill.style.width = `${fillPercents[idx]}%`;
    }

    // Update dots
    dots.forEach((dot) => {
      const dotNum = parseInt(dot.dataset.dot || '0', 10);
      dot.classList.remove('active', 'completed', 'upcoming');
      if (dotNum < currentStep) {
        dot.classList.add('completed');
      } else if (dotNum === currentStep) {
        dot.classList.add('active');
      } else {
        dot.classList.add('upcoming');
      }
    });

    // Update primary button
    if (btn && btnText) {
      if (currentStep === 6) {
        btn.style.display = 'none';
      } else {
        btn.style.display = '';
        const labelNext = wizard!.dataset.labelNext || 'Next';
        const labelSend = wizard!.dataset.labelSend || 'Send';
        btnText.textContent = currentStep === 5 ? labelSend : labelNext;
      }
    }

    // Update back button visibility — visible on steps 2–5
    if (btnBack) {
      btnBack.hidden = !(currentStep >= 2 && currentStep <= 5);
    }

    // Hide the actions footer on success step so the status centers in the panel
    if (actions) {
      actions.style.display = currentStep === 6 ? 'none' : '';
    }
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const CYRILLIC_RE = /[Ѐ-ӿ]/;

  type ContactField = 'name' | 'email' | 'phone';
  type ValidationError =
    | { kind: 'step'; step: number; message: string; otherButton?: HTMLButtonElement }
    | { kind: 'field'; field: ContactField; message: string };

  function collectErrors(): ValidationError[] {
    const errors: ValidationError[] = [];
    if (currentStep >= 1 && currentStep <= 4) {
      const stepNames = ['productType', 'readiness', 'platform', 'industry'];
      const stepKey = stepNames[currentStep - 1];
      const activeStep = wizard!.querySelector<HTMLDivElement>(
        `[data-step="${currentStep}"]`
      );
      const selectedOther =
        activeStep?.querySelector<HTMLButtonElement>('[data-other].selected') ??
        undefined;
      const value = selections[stepKey] ?? '';

      if (selectedOther) {
        if (value.length < 3) {
          errors.push({
            kind: 'step',
            step: currentStep,
            message: errorTexts.otherEmpty,
            otherButton: selectedOther,
          });
        }
      } else if (!value) {
        errors.push({
          kind: 'step',
          step: currentStep,
          message: errorTexts.selectOption,
        });
      }
    } else if (currentStep === 5) {
      const nameVal = (
        wizard!.querySelector<HTMLInputElement>('input[name="name"]')?.value ?? ''
      ).trim();
      const emailVal = (
        wizard!.querySelector<HTMLInputElement>('input[name="email"]')?.value ?? ''
      ).trim();
      const phoneVal = (
        wizard!.querySelector<HTMLInputElement>('input[name="phone"]')?.value ?? ''
      ).trim();

      if (nameVal.length < 3) {
        errors.push({ kind: 'field', field: 'name', message: errorTexts.name });
      }
      if (!EMAIL_RE.test(emailVal) || CYRILLIC_RE.test(emailVal)) {
        errors.push({ kind: 'field', field: 'email', message: errorTexts.email });
      }
      const phoneDigits = phoneVal.replace(/\D/g, '');
      if (phoneDigits.length !== 12 || !phoneDigits.startsWith('998')) {
        errors.push({ kind: 'field', field: 'phone', message: errorTexts.phone });
      }
    }
    return errors;
  }

  function showErrors(errors: ValidationError[]): void {
    for (const err of errors) {
      if (err.kind === 'step') {
        const el = wizard!.querySelector<HTMLElement>(
          `[data-step-error="${err.step}"]`
        );
        if (el) el.textContent = err.message;
        err.otherButton?.classList.add('has-error');
      } else {
        const el = wizard!.querySelector<HTMLElement>(
          `[data-field-error="${err.field}"]`
        );
        if (el) el.textContent = err.message;
        wizard!
          .querySelector<HTMLInputElement>(`input[name="${err.field}"]`)
          ?.classList.add('has-error');
      }
    }
  }

  function clearAllErrors(): void {
    wizard!
      .querySelectorAll<HTMLElement>('[data-step-error], [data-field-error]')
      .forEach((el) => {
        el.textContent = '';
      });
    wizard!.querySelectorAll<HTMLElement>('.has-error').forEach((el) => {
      el.classList.remove('has-error');
    });
  }

  function clearStepError(step: number): void {
    const el = wizard!.querySelector<HTMLElement>(`[data-step-error="${step}"]`);
    if (el) el.textContent = '';
    wizard!
      .querySelector<HTMLDivElement>(`[data-step="${step}"]`)
      ?.querySelectorAll<HTMLElement>('.has-error')
      .forEach((node) => node.classList.remove('has-error'));
  }

  function clearFieldError(field: ContactField): void {
    const el = wizard!.querySelector<HTMLElement>(`[data-field-error="${field}"]`);
    if (el) el.textContent = '';
    wizard!
      .querySelector<HTMLInputElement>(`input[name="${field}"]`)
      ?.classList.remove('has-error');
  }

  function focusFirstError(errors: ValidationError[]): void {
    const first = errors[0];
    if (!first) return;
    if (first.kind === 'field') {
      wizard!
        .querySelector<HTMLInputElement>(`input[name="${first.field}"]`)
        ?.focus();
    } else if (first.otherButton) {
      first.otherButton
        .querySelector<HTMLInputElement>('[data-other-input]')
        ?.focus();
    }
  }

  // Event delegation for option clicks
  wizard.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const option = target.closest<HTMLButtonElement>('[data-name]');

    if (option) {
      const name = option.dataset.name || '';

      // Deselect siblings (and clear any has-error marks on them)
      const siblings = option.parentElement?.querySelectorAll('[data-name]');
      siblings?.forEach((s) => {
        s.classList.remove('selected');
        s.classList.remove('has-error');
      });

      // Select this option
      option.classList.add('selected');

      // "Other" option — focus input; selection stays empty until user types
      const otherInput = option.querySelector<HTMLInputElement>('[data-other-input]');
      if (otherInput) {
        otherInput.focus();
        selections[name] = otherInput.value.trim();
      } else {
        selections[name] = option.dataset.value || '';
      }
      clearStepError(currentStep);
      return;
    }

    // Back button — step backward (stepper dots are status-only, not nav)
    if (target.closest('[data-brif-back]')) {
      if (currentStep > 1) {
        clearAllErrors();
        currentStep--;
        updateUI();
        track('brief_step', { step: currentStep, dir: 'back' });
      }
      return;
    }

    // Next / Send button
    if (target.closest('[data-brif-btn]')) {
      const errors = collectErrors();
      if (errors.length > 0) {
        showErrors(errors);
        btn?.classList.add('brif-btn--shake');
        setTimeout(() => btn?.classList.remove('brif-btn--shake'), 400);
        focusFirstError(errors);
        return;
      }
      clearAllErrors();

      if (currentStep === 5) {
        // Collect contact info and send
        const nameVal = wizard.querySelector<HTMLInputElement>('input[name="name"]')?.value.trim() || '';
        const projectVal = wizard.querySelector<HTMLInputElement>('input[name="projectName"]')?.value.trim() || '';
        const emailVal = wizard.querySelector<HTMLInputElement>('input[name="email"]')?.value.trim() || '';
        const phoneVal = wizard.querySelector<HTMLInputElement>('input[name="phone"]')?.value.trim() || '';

        const honeypot = wizard.querySelector<HTMLInputElement>('input[name="website"]')?.value || '';

        btn?.classList.add('brif-btn--loading');

        sendContact({
          productType: selections['productType'] || '',
          readinessStage: selections['readiness'] || '',
          platform: selections['platform'] || '',
          industry: selections['industry'] || '',
          name: nameVal,
          projectName: projectVal,
          email: emailVal,
          phone: phoneVal,
          website: honeypot,
          startedAt,
        })
          .then(() => {
            currentStep = 6;
            updateUI();
            track('brief_submit', { ok: true });
          })
          .catch((err) => {
            const errorEl = wizard.querySelector<HTMLParagraphElement>('[data-brif-error]');
            if (errorEl) {
              errorEl.textContent = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            }
            track('brief_submit', { ok: false });
          })
          .finally(() => {
            btn?.classList.remove('brif-btn--loading');
          });

        return;
      }

      if (currentStep < totalSteps) {
        currentStep++;
        updateUI();
        track('brief_step', { step: currentStep, dir: 'forward' });
      }
    }
  });

  // Update selection value as user types in "Other" inputs;
  // also clear validation errors as the user edits any contact input.
  wizard.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;

    if (input.matches('[data-other-input]')) {
      const option = input.closest<HTMLButtonElement>('[data-name]');
      if (option) {
        const name = option.dataset.name || '';
        selections[name] = input.value.trim();
        if (input.value.trim()) {
          option.classList.remove('has-error');
          clearStepError(currentStep);
        }
      }
      return;
    }

    const fieldName = input.getAttribute('name');
    if (
      fieldName === 'name' ||
      fieldName === 'email' ||
      fieldName === 'phone'
    ) {
      clearFieldError(fieldName);
    }
  });

  // "Other" input: clicks shouldn't re-trigger the option-click handler
  // (would cause a flicker on the .selected class). Focus, however, must
  // mark the parent option as selected — otherwise clicking directly into
  // the input never registers as picking the "Other" choice.
  wizard.querySelectorAll<HTMLInputElement>('[data-other-input]').forEach((inp) => {
    inp.addEventListener('click', (e) => e.stopPropagation());
    inp.addEventListener('focus', () => {
      const option = inp.closest<HTMLButtonElement>('[data-name]');
      if (!option) return;
      // Mark option selected and deselect *true* siblings only — leave
      // this option's own has-error untouched so the red border persists
      // until the user actually types something.
      option.parentElement
        ?.querySelectorAll<HTMLElement>('[data-name]')
        .forEach((s) => {
          if (s === option) return;
          s.classList.remove('selected');
          s.classList.remove('has-error');
        });
      option.classList.add('selected');
      const name = option.dataset.name || '';
      selections[name] = inp.value.trim();
    });
  });

  // Phone formatting: +998 XX XXX-XX-XX
  const PREFIX = '+998 ';
  const phoneInput = wizard.querySelector<HTMLInputElement>('[data-phone]');

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(3); // strip "998" prefix
    let result = PREFIX;
    if (digits.length > 0) result += digits.slice(0, 2);
    if (digits.length > 2) result += ' ' + digits.slice(2, 5);
    if (digits.length > 5) result += '-' + digits.slice(5, 7);
    if (digits.length > 7) result += '-' + digits.slice(7, 9);
    return result;
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      const pos = phoneInput.selectionStart ?? 0;
      const before = phoneInput.value.length;
      phoneInput.value = formatPhone(phoneInput.value);
      const after = phoneInput.value.length;
      const newPos = Math.max(PREFIX.length, pos + (after - before));
      phoneInput.setSelectionRange(newPos, newPos);
    });

    phoneInput.addEventListener('keydown', (e) => {
      const pos = phoneInput.selectionStart ?? 0;
      // Prevent deleting the prefix
      if (pos <= PREFIX.length && (e.key === 'Backspace' || e.key === 'Delete')) {
        if (phoneInput.selectionEnd === phoneInput.selectionStart) {
          if (e.key === 'Backspace') { e.preventDefault(); }
        }
      }
    });

    phoneInput.addEventListener('focus', () => {
      if (!phoneInput.value) phoneInput.value = PREFIX;
      // Move cursor to end
      const len = phoneInput.value.length;
      phoneInput.setSelectionRange(len, len);
    });
  }

  updateUI();
}
