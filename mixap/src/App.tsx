import React from 'react';
import { Provider } from 'urql';

import { RxProvider } from './db/RxProvider';
// import { gqlClient } from './db/supabase';

import Router from './features/navigation/Router';
import useStore from './hooks/useStore';

import 'react-medium-image-zoom/dist/styles.css';
import './App.css';
import { ObjectViewer } from './components/Object3f';
import { FullscreenViewer } from './features/fullscreenViewer/FullScreenViewer';
import { TextViewer } from './components/Text3f';
import { VideoViewer } from './components/Video3f';
import { ImageViewer } from './components';

import './assets/css/commun/layout.scss';

function App() {
  const isFullScreen = useStore((state) => state.playerSlice.isFullScreen);
  const mediaType = useStore((state) => state.playerSlice.mediaType);

  return (
    <RxProvider>
      {/* <Provider value={gqlClient}> */}
      <Router />
      {isFullScreen && mediaType !== 'image' && (
        <FullscreenViewer>
          {mediaType == 'object' && <ObjectViewer />}
          {mediaType == 'text' && <TextViewer />}
          {mediaType == 'video' && <VideoViewer />}
        </FullscreenViewer>
      )}
      {mediaType == 'image' && <ImageViewer />}
      {/* </Provider> */}
    </RxProvider>
  );
}

export default App;
