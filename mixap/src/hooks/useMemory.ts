import { useEffect } from 'react';
import { formatBytes } from '../utils/formatBytes';
import useLogger from './useLogger';

export function useMemory() {
  const log = useLogger('useMemory');

  useEffect(() => {
    function scheduleMeasurement() {
      // Check measurement API is available.
      // @ts-ignore
      if (!window.performance || !window.performance.memory) {
        log.warn('performance not available');
        return;
      }

      // @ts-ignore
      const interval = measurementInterval();
      //   log.debug(
      //     `Running next memory measurement in ${Math.round(
      //       interval / 1000,
      //     )} seconds`,
      //   );
      setTimeout(performMeasurement, interval);
    }

    function measurementInterval() {
      const MEAN_INTERVAL_IN_MS = 5 * 1000;
      return -Math.log(Math.random()) * MEAN_INTERVAL_IN_MS;
    }

    async function performMeasurement() {
      // @ts-ignore
      const memory = performance.memory.usedJSHeapSize;
      // 2. Record the result.
      log.debug('Memory Mb:', formatBytes(memory));
      log.debug(
        'Memory %',
        formatBytes(
          // @ts-ignore
          (memory / performance.memory.jsHeapSizeLimit) * 100,
        ),
      );
      log.debug(
        'Memory % from total',
        formatBytes(
          // @ts-ignore
          (memory / performance.memory.totalJSHeapSize) * 100,
        ),
      );

      // 3. Schedule the next measurement.
      scheduleMeasurement();
    }

    scheduleMeasurement();
  }, []);
}
