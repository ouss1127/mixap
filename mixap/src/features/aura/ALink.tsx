import React, { useCallback, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber'; // Hook for accessing the Three.js context
import { Html } from '@react-three/drei'; // Component for rendering HTML elements in 3D space
import { useSpring, a as a3f } from '@react-spring/three'; // Spring animations for Three.js objects
import { useGesture } from '@use-gesture/react'; // Gesture handling for React
import { Typography, Popover } from 'antd'; // Ant Design components for typography and popovers
import { LinkOutlined, DeleteOutlined } from '@ant-design/icons'; // Icons from Ant Design

/** @jsxImportSource @emotion/react */ // Enables the use of the css prop for styling

import useControls from '../../hooks/useControls'; // Custom hook for managing control forms
import useStore from '../../hooks/useStore'; // Custom hook for accessing the store
import { useTrace } from '../../hooks/useTrace'; // Custom hook for tracing user interactions
import { TRACES } from '../../db/traces'; // Trace constants for tracking events
import { AuraMode } from '../editor/Board'; // Enum for the different aura modes

import { useTranslation } from 'react-i18next'; // Hook for internationalization (i18n)

export function ALink({ id, canvasRef, mode, onChange, onDelete }: any) {
  // Retrieve the content and configuration (cfg) of the aura item from the store
  const { content, cfg, activityId, type } = useStore((store) =>
    store.auraSlice.find(id),
  ) as any;

  // Initialize translation function
  const { t } = useTranslation();

  // State for the link text and URL, with default values
  const [linkText, setLinkText] = useState<string>(
    content.value || t('common.edit-link'),
  );
  const [url, setUrl] = useState<string>(content.url || '');

  // Ensure the URL is properly formatted
  const formattedUrl =
    url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `http://${url}`;

  // Get the viewport and size from Three.js context for positioning calculations
  const { viewport, size } = useThree();
  const widthFactor = size.width / viewport.width;
  const heightFactor = size.height / viewport.height;

  // State for the position, rotation, and scale of the link component in 3D space
  const [position, setPosition] = useState<any>(cfg?.position || [0, 0, 0]);
  const [rotation] = useState<[number, number, number]>(
    cfg?.rotation || [0, 0, 0],
  );
  const [scale] = useState<any>(cfg?.scale || [1, 1, 1]);

  // State to control the visibility of the control form popover
  const [visibleControls, setVisibleControls] = useState<boolean>(true);

  // Hook for tracing interactions
  const { trace } = useTrace({});

  // Handler to toggle the visibility of the controls
  const handleControlsVisibility = (visible: boolean) => {
    setVisibleControls(visible);
  };

  // Define the control options for the link component, including a URL input and delete button
  const options = [
    {
      component: 'InputLink',
      icon: <LinkOutlined />,
      label: 'URL',
      key: 'url',
      value: url,
      size: 'large',
      placeholder: 'Enter link URL',
      description: '',
      onChange: (newUrl) => setUrl(newUrl), // Update the URL when changed
    },
    {
      component: 'Button',
      icon: <DeleteOutlined />,
      label: 'delete',
      key: 'delete',
      defaultValue: 400,
      size: 'large',
      onClick: onDelete,
      description: '',
    },
  ];

  // Initialize the control form using the useControls hook
  const { controlsForm } = useControls({
    options,
    fieldsValue: { ...cfg?.style }, // Spread the properties to avoid mutation
    initialValues: { ...cfg?.style }, // Spread the properties to avoid mutation
    onChange: ({ allFields }) => {
      setUrl(allFields.url || ''); // Update the URL when the form changes
    },
  });

  // Set up spring animation for smooth movement of the component
  const [spring, api] = useSpring<any>(() => ({
    position: cfg.position || [0, 0, 0],
  }));

  // Effect to handle updates when the link text, URL, or other properties change
  useEffect(() => {
    onChange &&
      onChange({
        id,
        activityId,
        type,
        content: { value: linkText, url: formattedUrl },
        cfg: {
          position,
          scale,
          rotation,
        },
      });
  }, [
    linkText,
    formattedUrl,
    position,
    scale,
    rotation,
    onChange,
    id,
    activityId,
    type,
  ]);

  // Handle drag gestures to move the link component in 3D space
  const gesture = useGesture(
    {
      onDragEnd: ({ offset: [x, y] }) => {
        setPosition([x / widthFactor, -y / heightFactor, 0]); // Update position state
        trace(TRACES.DRAG_AURA); // Log the drag action
      },
      onDrag: ({ pinching, cancel, offset: [x, y] }) => {
        if (pinching) {
          return cancel(); // Cancel if pinching (multi-touch gesture)
        }
        api.start({
          position: [x / widthFactor, -y / heightFactor, 0], // Update position during drag
        });
      },
    },
    {
      drag: { bounds: canvasRef, rubberband: true }, // Constrain drag within bounds with elastic effect
    },
  );

  return (
    <>
      {/* ARView Mode */}
      {mode === AuraMode.ARVIEW && (
        <group
          scale={[1, 1, 1]}
          position={[
            (cfg.position[0] * cfg.factor + cfg.marker.width / 2) *
              cfg.marker.widthRatio,
            (cfg.position[1] * cfg.factor + cfg.marker.height / 2) *
              cfg.marker.heightRatio,
            0,
          ]}>
          <Html>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
              }}>
              {url ? (
                <a
                  href={formattedUrl}
                  target='_blank'
                  rel='noopener noreferrer'>
                  <LinkOutlined
                    style={{
                      fontSize: '24px',
                      color: '#1890ff',
                      backgroundColor: '#fff',
                      borderRadius: '50%',
                      padding: '8px',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </a>
              ) : (
                <Typography.Title level={5}>
                  {t('common.click-edit')}
                </Typography.Title>
              )}
            </div>
          </Html>
        </group>
      )}

      {/* ARCanvas Mode */}
      {mode === AuraMode.ARCANVAS && (
        <group position={cfg.position}>
          <Html>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
              }}>
              {url ? (
                <a
                  href={formattedUrl}
                  target='_blank'
                  rel='noopener noreferrer'>
                  <LinkOutlined
                    style={{
                      fontSize: '24px',
                      color: '#1890ff',
                      backgroundColor: '#fff',
                      borderRadius: '50%',
                      padding: '8px',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </a>
              ) : (
                <Typography.Title level={5}>
                  {t('common.click-edit')}
                </Typography.Title>
              )}
            </div>
          </Html>
        </group>
      )}

      {/* Canvas Mode */}
      {mode === AuraMode.CANVAS && (
        <a3f.group {...spring}>
          <Html
            zIndexRange={[100, 100]}
            style={{
              width: cfg.width,
              height: cfg.height,
              left: -cfg.width / 2,
              top: -cfg.height / 2,
              cursor: 'move',
              border: '2px dashed var(--hot-color)',
            }}>
            <Popover
              color='var(--active-color)'
              content={controlsForm}
              visible={visibleControls}
              onVisibleChange={handleControlsVisibility}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  touchAction: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                {...gesture()}>
                {url ? (
                  <a
                    href={formattedUrl}
                    target='_blank'
                    rel='noopener noreferrer'>
                    <LinkOutlined
                      style={{
                        fontSize: '24px',
                        color: '#1890ff',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        padding: '8px',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </a>
                ) : (
                  <Typography.Title level={5}>
                    {t('common.click-edit')}
                  </Typography.Title>
                )}
              </div>
            </Popover>
          </Html>
        </a3f.group>
      )}
    </>
  );
}
