// Carga única del widget de Cloudflare Turnstile, compartida por los formularios que lo usan.
let loading = null;
export function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ||= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => { loading = null; script.remove(); reject(new Error('turnstile')); };
    document.head.append(script);
  });
  return loading;
}
