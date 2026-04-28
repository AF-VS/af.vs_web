export function scheduleBotIdInit(): void {
  if (import.meta.env.DEV) return;
  const run = (): void => {
    void import('botid/client/core').then(({ initBotId }) => {
      initBotId({ protect: [{ path: '/api/contact', method: 'POST' }] });
    });
  };
  const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
  if (ric) ric(run);
  else setTimeout(run, 0);
}
