import { useState, useEffect, useCallback } from 'react';
import type { Video } from '../types/video';

const API_URL = 'http://localhost:3001/api/videos';

type FetchState = {
  data: Video[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useVideos(): FetchState {
  const [data, setData] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Incrementar este contador dispara el useEffect sin recargar la página
  const [fetchCount, setFetchCount] = useState(0);

  const refetch = useCallback(() => {
    setFetchCount((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const videos: Video[] = await response.json();
        if (!cancelled) setData(videos);
      } catch (err) {
        if (!cancelled) {
          // Distinguir entre error de red (backend apagado) y error HTTP
          const isNetworkError =
            err instanceof TypeError && err.message.includes('fetch');

          setError(
            isNetworkError
              ? 'No se pudo conectar con el servidor. ¿Está el backend corriendo?'
              : err instanceof Error
              ? err.message
              : 'Error desconocido al cargar los videos',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchVideos();

    return () => {
      cancelled = true;
    };
  // fetchCount como dependencia: cuando cambia, se re-ejecuta el fetch
  }, [fetchCount]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch };
}
