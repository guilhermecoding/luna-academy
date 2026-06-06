/**
 * Script bloqueante para aplicar tema antes da primeira pintura.
 * Evita que navegadores (Android, Samsung Internet, etc.) forcem inversão de cores
 * antes do next-themes hidratar a classe .dark no <html>.
 *
 * Deve permanecer alinhado com ThemeProvider (storageKey: "theme", attribute: "class").
 */
export const THEME_INIT_SCRIPT = "(function(){try{var d=document.documentElement;var t=localStorage.getItem(\"theme\");var m=window.matchMedia(\"(prefers-color-scheme: dark)\");var dark=t===\"dark\"||(t!==\"light\"&&m.matches);d.classList.toggle(\"dark\",dark);d.classList.toggle(\"light\",!dark&&t===\"light\");d.style.colorScheme=dark?\"only dark\":\"only light\";}catch(e){}})();";
