import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { RxColOp } from '../../db/types';
import { useActivity } from '../../hooks/useActivity';

import Editor from '../editor/Editor';
import Player from '../player/Player';
import Dashboard from '../dashboard/Dashboard';
import Home from '../home/Home';
import Activity from '../activity/Activity';
import Share from '../share/Share';
import ActivityMenu from '../activity/ActivityMenu';
import useLogger from '../../hooks/useLogger';
import useAuth from '../../hooks/useAuth';
import useInstall from '../../hooks/useInstall';
import { useMemory } from '../../hooks/useMemory';
// import useScreenOrientation from '../../hooks/useScreenOrientation';

export default function Router() {
  const log = useLogger('Router');

  log.debug('Render');

  const { onRxColActivity } = useActivity();
  const { onRxColUser } = useAuth();

  useInstall();
  // useMemory();
  // useScreenOrientation();

  useEffect(() => {
    // get users' activities and auras
    onRxColActivity(RxColOp.FindAll, {
      /** */
    });
    onRxColUser(RxColOp.FindOne, {
      /** */
    });
  }, [onRxColActivity, onRxColUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/about'
          element={<About />}
        />
        <Route
          path='/edit-activity/:id/:ancre'
          element={<Editor />}
        />
        <Route
          path='/view-activity/:id/:ancre'
          element={<Activity />}
        />
        <Route
          path='/play-activity/:id/:ancre'
          element={<Player />}
        />
        <Route
          path='/share-activity/:userId/:activityId/:token'
          element={<Share />}
        />
        <Route
          path='/dashboard'
          element={<Dashboard />}
        />
        <Route
          path='/library'
          element={<Home />}
        />
        <Route
          path='/'
          element={<Home />}
        />
      </Routes>

      <ActivityMenu />
    </BrowserRouter>
  );
}

function About() {
  return (
    <div>
      <h2>About</h2>
    </div>
  );
}
