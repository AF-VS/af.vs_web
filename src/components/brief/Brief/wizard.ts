import { sendContact } from '../../../lib/contact';

export function initBrifWizard(): void {
  // Time-trap anchor — measures time from wizard-visible to submit.
  // Resets on astro:page-load (SPA nav); fine for this single-page lander.
  const startedAt = Date.now();

  const wizard = document.querySelector<HTMLDivElement>('[data-wizard]');
  if (!wizard) return;

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

  function validateStep(): boolean {
    if (currentStep >= 1 && currentStep <= 4) {
      const stepNames = ['productType', 'readiness', 'platform', 'industry'];
      const name = stepNames[currentStep - 1];
      return !!selections[name];
    }
    if (currentStep === 5) {
      const nameInput = wizard!.querySelector<HTMLInputElement>('input[name="name"]');
      const emailInput = wizard!.querySelector<HTMLInputElement>('input[name="email"]');
      const nameVal = nameInput?.value.trim() ?? '';
      const emailVal = emailInput?.value.trim() ?? '';
      return !!nameVal && EMAIL_RE.test(emailVal);
    }
    return true;
  }

  function focusInvalidField(): void {
    if (currentStep >= 1 && currentStep <= 4) {
      const activeStep = wizard!.querySelector<HTMLDivElement>('[data-step].is-active');
      const emptyOther = activeStep?.querySelector<HTMLInputElement>(
        '[data-other-input]'
      );
      const parentOption = emptyOther?.closest<HTMLButtonElement>('[data-name]');
      if (emptyOther && parentOption?.classList.contains('selected')) {
        emptyOther.focus();
      }
      return;
    }
    if (currentStep === 5) {
      const nameInput = wizard!.querySelector<HTMLInputElement>('input[name="name"]');
      const emailInput = wizard!.querySelector<HTMLInputElement>('input[name="email"]');
      if (!nameInput?.value.trim()) {
        nameInput?.focus();
        return;
      }
      if (!EMAIL_RE.test(emailInput?.value.trim() ?? '')) {
        emailInput?.focus();
      }
    }
  }

  // Event delegation for option clicks
  wizard.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const option = target.closest<HTMLButtonElement>('[data-name]');

    if (option) {
      const name = option.dataset.name || '';

      // Deselect siblings
      const siblings = option.parentElement?.querySelectorAll('[data-name]');
      siblings?.forEach((s) => s.classList.remove('selected'));

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
      return;
    }

    // Back button — step backward (stepper dots are status-only, not nav)
    if (target.closest('[data-brif-back]')) {
      if (currentStep > 1) {
        currentStep--;
        updateUI();
      }
      return;
    }

    // Next / Send button
    if (target.closest('[data-brif-btn]')) {
      if (!validateStep()) {
        btn?.classList.add('brif-btn--shake');
        setTimeout(() => btn?.classList.remove('brif-btn--shake'), 400);
        focusInvalidField();
        return;
      }

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
          })
          .catch((err) => {
            const errorEl = wizard.querySelector<HTMLParagraphElement>('[data-brif-error]');
            if (errorEl) {
              errorEl.textContent = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            }
          })
          .finally(() => {
            btn?.classList.remove('brif-btn--loading');
          });

        return;
      }

      if (currentStep < totalSteps) {
        currentStep++;
        updateUI();
      }
    }
  });

  // Update selection value as user types in "Other" inputs
  wizard.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    if (!input.matches('[data-other-input]')) return;
    const option = input.closest<HTMLButtonElement>('[data-name]');
    if (option) {
      const name = option.dataset.name || '';
      selections[name] = input.value.trim();
    }
  });

  // Prevent "Other" input clicks from bubbling (avoid re-triggering option click)
  wizard.querySelectorAll<HTMLInputElement>('[data-other-input]').forEach((inp) => {
    inp.addEventListener('click', (e) => e.stopPropagation());
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
