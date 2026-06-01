import { useCallback, useEffect, useRef } from 'react';

/** Refs so Pan gesture handlers always read current flags (avoids stale React state). */
export function useStraightLineTraceGestureFlags(roundActive: boolean, done: boolean) {
  const roundActiveRef = useRef(roundActive);
  const doneRef = useRef(done);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  useEffect(() => {
    doneRef.current = done;
  }, [done]);

  const resetDrag = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const beginDrag = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const canInteract = useCallback(
    () => roundActiveRef.current && !doneRef.current,
    [],
  );

  return { roundActiveRef, doneRef, isDraggingRef, resetDrag, beginDrag, canInteract };
}

export const STRAIGHT_LINE_NEXT_ROUND_MS = 400;
