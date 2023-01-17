import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, time: number) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    console.log('useInterval useEffect');
    function run() {
      savedCallback.current?.();
    }
    let interval = setInterval(run, time);
    return () => {
      clearInterval(interval);
      console.log('useInterval useEffect return');
    };
  }, [time]);
}
