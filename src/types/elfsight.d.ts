/** Elfsight platform loader, injected from routes/__root.tsx. */
interface Window {
  eapps?: { platform?: { initialize?: () => void } };
}
