import { useEffect, useRef } from 'react';

/** 50ms poll so hold timers advance on tablet when face pose is steady. */
export function useNativeLipPoll(
  enabled: boolean,
  isDetecting: boolean,
  onTick: () => void,
) {
  const tickRef = useRef(onTick);
  tickRef.current = onTick;

  useEffect(() => {
    if (!enabled) return;
    if (!isDetecting) return;
    const run = () => tickRef.current();
    run();
    const id = setInterval(run, 50);
    return () => clearInterval(id);
  }, [enabled, isDetecting]);
}
