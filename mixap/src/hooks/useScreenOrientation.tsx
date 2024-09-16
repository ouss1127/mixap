import React, { useEffect } from 'react';

import { notification, Typography } from 'antd';

import { isMobile } from '../utils/platfrom';
import { MobileOutlined } from '@ant-design/icons';

export default function useScreenOrientation() {
  useEffect(() => {
    const onOrientationchange = (e) => {
      const orientation = e.target.screen.orientation;

      if (!['portrait-primary', 'portrait'].includes(orientation.type)) {
        notification.warning({
          message: 'Mauvaise Orientation !!',
          description: (
            <Typography.Text>
              Merci de mettre l&apos;appreil en mode{' '}
              <Typography.Text>portrait</Typography.Text> <MobileOutlined /> !!
            </Typography.Text>
          ),
          duration: 0,
          key: 'appOrientation',
        });
      }
    };

    console.log('isMobile()', isMobile());
    if (isMobile()) {
      // window.screen.orientation.lock('portrait');
      window.addEventListener('orientationchange', onOrientationchange, true);
    }

    return () => {
      if (isMobile()) {
        window.removeEventListener('orientationchange', onOrientationchange);
      }
    };
  }, []);

  //   const toggleFullscreen = useCallback(() => {
  //     // @ts-ignore
  //     console.log('document.requestFullscreen', document.body.requestFullscreen);

  //     if (document.body.requestFullscreen) {
  //       document.body.requestFullscreen(); // @ts-ignore
  //     } else if (document.body.webkitRequestFullscreen) {
  //       /* Safari */ // @ts-ignore
  //       document.body.webkitRequestFullscreen();
  //       // @ts-ignore
  //     } else if (document.body.msRequestFullscreen) {
  //       /* IE11 */ // @ts-ignore
  //       document.body.msRequestFullscreen();
  //     }
  //   }, []);
}
