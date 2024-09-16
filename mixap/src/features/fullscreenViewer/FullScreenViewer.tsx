import useStore from '../../hooks/useStore';
import { Layout, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

export function FullscreenViewer({ children }: { children: React.ReactNode }) {
  const setFullScreen = useStore((state) => state.playerSlice.setFullScreen);
  return (
    <Layout
      style={{
        overflow: 'visible',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5',
        position: 'absolute',
        display: 'flex',
        zIndex: '10000000000000000',
      }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'end',
        }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
          }}>
          {children}
        </div>
        <Button
          style={{
            overflow: 'visible',
            position: 'absolute',
            marginRight: '32px',
            marginTop: '32px',
          }}
          onClick={() => {
            setFullScreen(false, '');
          }}
          size='large'
          shape='circle'
          icon={<CloseOutlined />}></Button>
      </div>
    </Layout>
  );
}
