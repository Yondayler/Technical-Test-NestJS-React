import { useState, useEffect, useCallback } from 'react';
import type { Video } from '../types/video';

const BASE_URL = 'http://localhost:3001/api/videos';

type SortKey = 'hype-desc' | 'hype-asc' | 'date-desc' | 'date-asc' | 'title-asc';

type FetchState = {
  data: Video[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

interface UseVideosOptions {
  sort?: SortKey;
  search?: string;
}

export function useVideos({ sort = 'hype-desc', search = '' }: UseVideosOptions = {}): FetchState {
  const [data, setData] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

        // Construir la URL con los query params de sort y search
        const params = new URLSearchParams();
        if (sort) params.set('sort', sort);
        if (search.trim()) params.set('search', search.trim());

        const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const videos: Video[] = await response.json();
        if (!cancelled) setData(videos);
      } catch (err) {
        if (!cancelled) {
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
  // Re-ejecutar cuando cambian sort, search o fetchCount
  }, [sort, search, fetchCount]);

  return { data, loading, error, refetch };
}
