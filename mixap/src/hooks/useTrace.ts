import { useParams } from 'react-router-dom';

import supabase from '../db/supabase';
import useStore from './useStore';
import { TRACES } from '../db/traces';
import useLogger from './useLogger';

//Traces enumeration
export const Traces = {
  UserId: 'UserId',
  Time: 'Time',
  Type: 'Type',
  Name: 'Name',
  State: 'State',
  Update: 'Update',
  Log: 'Log',
};

//Hook useTrace to trace the lifecycle of a component
export function useTrace(context = {}, active = true) {
  const log = useLogger('useTrace');

  const { id } = useParams();
  const user = useStore((state) => state.authSlice.user);
  const activityId = useStore((state) => state.activitySlice.currActitityId);

  let trace;
  if (active && import.meta.env.REACT_APP_TRACE) {
    trace = async (action: TRACES, args: Record<string, any> = {}) => {
      args.timestampIso = new Date().toISOString();
      args.timestamp = Date.now();

      args.userId = user?.id;
      args.activityId = id || activityId;
      args.duration = args.duration ? args.duration / 1000 : undefined;

      args = { ...context, ...args, traceType: action };

      log.debug(args);

      await supabase.from('Trace').insert(args);
    };
  } else {
    trace = () => {
      //
    };
  }

  return { trace };
}
