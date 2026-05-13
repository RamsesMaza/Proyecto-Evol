import { useState, useEffect, useRef } from 'react';

export interface UseSkeletonOptions {
  /** Minimum time (ms) the skeleton stays visible to prevent flicker */
  minDisplayMs?: number;
  /** Delay (ms) before showing the skeleton (null = instant) */
  delayMs?: number | null;
}

interface UseSkeletonReturn {
  /** Whether the skeleton should be shown */
  show: boolean;
}

export function useSkeleton(
  isLoading: boolean,
  options: UseSkeletonOptions = {}
): UseSkeletonReturn {
  const { minDisplayMs = 500, delayMs = 180 } = options;
  const [show, setShow] = useState(isLoading);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showStartedAt = useRef<number>(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Loading just started
    if (isLoading) {
      if (delayMs === null) {
        setShow(true);
        showStartedAt.current = Date.now();
      } else {
        timerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          setShow(true);
          showStartedAt.current = Date.now();
        }, delayMs);
      }
      return;
    }

    // Loading just finished — hide skeleton with min display time
    if (!isLoading) {
      const elapsed = Date.now() - showStartedAt.current;
      const remaining = Math.max(0, minDisplayMs - elapsed);

      if (remaining <= 0) {
        setShow(false);
      } else {
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) setShow(false);
        }, remaining);
      }
    }
  }, [isLoading, delayMs, minDisplayMs]);

  return { show };
}
