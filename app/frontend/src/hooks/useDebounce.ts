import { useState, useEffect } from 'react';

/**
 * Retrasa la actualización de un valor hasta que el usuario deje de
 * modificarlo durante `delay` milisegundos.
 * Ideal para evitar peticiones HTTP en cada pulsación de teclado.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
