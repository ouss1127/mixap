import { useCallback } from 'react';
import { useRxCollection } from 'rxdb-hooks';

import { RxColOp, UserDocType } from '../db/types';
import { getCode } from '../utils/uniqueId';
import useLogger from './useLogger';
import useStore from './useStore';

export default function useAuth() {
  const log = useLogger('useAuth');

  const rxColUsers = useRxCollection<UserDocType>('users');
  const set = useStore((state) => state.authSlice.set);

  const onRxColUser = useCallback(
    (rxColOp: RxColOp, payload: Partial<UserDocType>) => {
      // TODO a react rerender somewhere makes `set` to be undefined
      if (!rxColUsers || !set) {
        log.warn('rxColUsers activity halted', rxColUsers);
        return;
      }

      (async () => {
        switch (rxColOp) {
          case RxColOp.FindOne: {
            log.debug(`${rxColOp}: FindOne `);

            let doc = (await rxColUsers
              .findOne({
                selector: {
                  host: true,
                },
              })
              .exec()) as any;

            if (doc) {
              doc = (await doc?.toJSON()) as Partial<UserDocType>;
            } else {
              const data = {
                id: getCode(),
                host: true,
              };
              doc = (await rxColUsers.insert(data as UserDocType)).toJSON() as any;
            }

            set(doc as Partial<UserDocType>);

            break;
          }

          default:
            break;
        }

        log.debug(`${rxColOp}: payload <-`, payload);
      })();
    },
    [rxColUsers, set],
  );

  return { onRxColUser };
}
