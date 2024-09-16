import React, { useState, useEffect, useRef } from 'react';
import { RxDatabase } from 'rxdb';
import { Provider } from 'rxdb-hooks';

import { getDB } from './rxdb';
// import { LocalDbCollections } from './types';
import useLogger from '../hooks/useLogger';

export function RxProvider({ children }: any) {
  const log = useLogger('RxProvider');

  log.debug('Render');

  const ref = useRef<any>(null);
  const [db, setDb] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const db = await getDB();
      setDb(true);

      ref.current = db;
      log.debug('db ref.current', ref.current);
    })();
  }, [ref]);

  return <>{db && <Provider db={ref.current}>{children}</Provider>}</>;
}
