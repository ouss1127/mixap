import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react';
import { Html, OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import useStore from '../hooks/useStore';

import { CloseCircleFilled, CloseOutlined } from '@ant-design/icons';

import { RenderingOrder } from '../features/arview';

import { Layout, Button, Spin, FloatButton } from 'antd';
import { Canvas } from '@react-three/fiber';
import { FullscreenViewer } from '@/features/fullscreenViewer/FullScreenViewer';

// const Scene = ({ object, ...props }: any) => {
//   const copiedScene = useMemo(() => object.clone(true), [object]);
//   console.log('copiedScene', object);

//   return (
//     <primitive
//       {...props}
//       object={copiedScene}
//     />
//   );
// };

let currentModel;

function Texture({
  url,
  type,
  scale,
  position,
}: {
  url: any;
  type: string;
  scale?: any;
  position?: any;
}) {
  const [model, setModel] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<any>(null);
  const setFullScreen = useStore((state) => state.playerSlice.setFullScreen);

  const handleLoadModel = useCallback(
    (type, model) => {
      if (['glb', 'gltf'].includes(type)) {
        model = model?.scene;
      }
      setModel(model);
      setLoading(false);
    },
    [model],
  );

  const handleProgress = useCallback(() => {
    // no op
  }, []);

  useEffect(() => {
    if (url) {
      setLoading(true);

      console.log(' Loader3f file, type', url, type);

      switch (type) {
        case 'glb':
        case 'gltf': {
          new GLTFLoader().load(
            url,
            handleLoadModel.bind(null, type),
            handleProgress,
            setError,
          );
          break;
        }
        case 'fbx': {
          new FBXLoader().load(
            url,
            handleLoadModel.bind(null, type),
            handleProgress,
            setError,
          );
          break;
        }
        case 'obj': {
          new OBJLoader().load(
            url,
            handleLoadModel.bind(null, type),
            handleProgress,
            setError,
          );
          break;
        }
        case 'stl': {
          new STLLoader().load(
            url,
            handleLoadModel.bind(null, type),
            handleProgress,
            setError,
          );
          break;
        }
        default:
          break;
      }
    }
  }, [url]);

  if (model) {
    model.children[0].renderOrder = RenderingOrder.object;
  }

  currentModel = model;

  return (
    <>
      {model && (
        <primitive
          onClick={() => {
            setFullScreen(true, 'object');
            console.log('INOD CLICKED 3D');
          }}
          object={model}
          scale={scale}
          position={position}
          renderOrder={RenderingOrder.object}>
          <meshBasicMaterial
            transparent={false}
            toneMapped={false}
            depthTest={true}
            depthWrite={false}
            polygonOffset={true}
            polygonOffsetUnits={5}
            polygonOffsetFactor={5}></meshBasicMaterial>
        </primitive>
      )}
      {loading && (
        <Html center>
          <Spin />
        </Html>
      )}
    </>
  );
}

export function ObjectViewer() {
  return (
    <Canvas
      // style={{ height: 450 }}
      camera={{ fov: 75, position: [300, 300, 300] }}>
      <ambientLight intensity={1}></ambientLight>
      <primitive object={currentModel.clone()} />
      <OrbitControls></OrbitControls>
    </Canvas>
  );
}

export function Object3f(props: any) {
  const { file, ...others } = props;

  const [url, setUrl] = useState<any>(null);

  useEffect(() => {
    if (!file) return;

    let objectUrl;
    const urlCreator = window.URL || window.webkitURL;

    if (typeof file === 'string' || file instanceof String) {
      setUrl(file);
    } else {
      objectUrl = urlCreator.createObjectURL(file);
      setUrl(objectUrl);
    }

    return () => {
      urlCreator.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    url && (
      <Texture
        {...others}
        url={url}
      />
    )
  );
}
