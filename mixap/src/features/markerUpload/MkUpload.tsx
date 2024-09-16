import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Upload,
  Typography,
  Button,
  Space,
  Tabs,
  Modal,
  Divider,
  message,
  Input,
} from 'antd';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

import {
  BulbOutlined,
  CameraOutlined,
  DeleteOutlined,
  InboxOutlined,
  PlusOutlined,
} from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'sk-proj-yESQDypXwephO39cjnqlT3BlbkFJUUJMBHHNkoPW2N90wbQ5',
  dangerouslyAllowBrowser: true,
});

import { compressImage, compressImageBase64 } from '../../utils/loadImage';

import { Imager } from '../../components/Imager';
import Spinner3f from '../../components/Spinner';
import useStore from '../../hooks/useStore';
import { EditorStatus } from '../editor/slice';
import useLogger from '../../hooks/useLogger';
import { Snapshot } from '../../components/Snapshot';

import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;

export default function MkUpload({
  multiple,
  maxCount,
  onChange,
  activity,
  markerImages,
  size,
}: any) {
  const log = useLogger('MkUpload');

  const [snapOpen, setSnapOpen] = useState(false);
  const [snapMoreOpen, setSnapMoreOpen] = useState(false);
  const [markerFeaturesOpen, setMarkerFeaturesOpen] = useState(false);
  const [files, setFiles] = useState<any[]>(markerImages || []);
  const [activeTab, setActiveTab] = useState('0');

  const maxWidth = (2 * size.width) / 3;
  const maxHeight = (2 * size.height) / 3;

  const { t } = useTranslation();

  log.debug('Render');

  const handleCropComplete = useCallback(
    async (index, blob) => {
      const cfile = await compressImageBase64(blob);
      const newFileList = [...files];
      newFileList[index] = cfile;

      setFiles(newFileList);

      onChange({
        markerImages: newFileList,
        markerFile: null,
        activity,
        imagesCfg: [],
      });
    },
    [files, setFiles, compressImage],
  );

  const handleSaveImage = (base64) => {
    const data = [...files, base64];

    setFiles(data);
    setSnapOpen(false);
    setMarkerFeaturesOpen(false);

    onChange({
      markerImages: data,
      markerFile: null,
      activity,
      imagesCfg: [],
    });
  };

  const handleBeforeUpload = async (file, fileList) => {
    let newFileList: any[] = [];
    let cfile;

    await Promise.all(
      Array.from({ length: fileList?.length }, async (_, index) => {
        cfile = await compressImage(fileList[index]);
        newFileList.push(cfile);
      }),
    );

    newFileList = [...files, ...newFileList];

    setFiles(newFileList);

    setActiveTab('' + (newFileList?.length - 1));

    onChange({
      markerImages: newFileList,
      markerFile: null,
      activity,
      imagesCfg: [],
    });

    return false;
  };

  const handleRemove = () => {
    setFiles([]);
    onChange({
      markerImages: [],
      markerFile: null,
      activity,
      imagesCfg: [],
    });
  };

  useMemo(() => {
    if (markerImages) {
      setFiles(markerImages);
    }
  }, [markerImages]);

  const showSnap = () => {
    setSnapOpen(true);

    snapMoreOpen && setSnapMoreOpen(false);
  };

  const hideSnap = () => {
    setSnapOpen(false);
  };

  const showMarkerFeatures = () => {
    setMarkerFeaturesOpen(true);
  };

  const hideMarkerFeatures = () => {
    setMarkerFeaturesOpen(false);
  };

  return (
    <>
      <Snapshot
        visible={snapOpen}
        showModal={showSnap}
        onCancel={hideSnap}
        onChange={handleSaveImage}
      />
      <Snapshot
        visible={markerFeaturesOpen}
        showModal={showMarkerFeatures}
        onCancel={hideMarkerFeatures}
      />

      {files?.length !== 0 && (
        <Tabs
          tabPosition='right'
          css={{
            width: maxWidth,
            height: maxHeight,
            '& .ant-tabs-nav': {
              position: 'absolute',
              right: '-36px',
              padding: `2px 4px`,
            },
            '& .ant-tabs-content-holder': {
              border: 'none',
            },
            '&  .ant-tabs-tab': {
              paddingLeft: '4px !important',
              paddingRight: '4px !important',
              margin: `0px 0 0 0 !important`,
            },
            '& .ant-tabs-content': {
              width: 'auto !important',
            },
            '& .ant-tabs-tabpane': {
              padding: '0px !important',
            },
            '&  .ant-tabs-content-holder': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
          centered
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}>
          {files?.map((file, index) => (
            <TabPane
              key={'' + index}
              tab={
                <Button
                  size='small'
                  shape='circle'>
                  {index + 1}
                </Button>
              }
              closable={false}>
              <Imager
                aspect={true}
                key={file.uid || file}
                file={file}
                maxWidth={maxWidth}
                maxHeight={maxHeight}
                shouldCrop={true}
                onCropComplete={handleCropComplete.bind(null, index)}
                // width={markerImagesCfg[index]?.worldWidth}
                // height={markerImagesCfg[index]?.worldHeight}
              />
              <Button
                danger
                css={{
                  marginLeft: 'auto',
                  position: 'absolute',
                  // transform: `translate(50%, 90px)`,
                  right: '-32px',
                  top: `50%`,
                  transform: `translate(50%, 52px)`,
                }}
                onClick={handleRemove}
                type='text'
                size='large'
                icon={<DeleteOutlined />}
              />

              {maxCount !== files?.length && (
                <>
                  <Button
                    onClick={() => {
                      setSnapMoreOpen(true);
                    }}
                    type='primary'
                    size='large'
                    css={{
                      position: 'absolute',
                      transform: `translate(89px, 50%)`, // 89px = width / 2
                      right: '50%',
                      bottom: -35,
                    }}
                    icon={<PlusOutlined />}>
                    {t('common.additional-marker')} {files?.length + 1}{' '}
                  </Button>
                  <Modal
                    centered
                    open={snapMoreOpen}
                    destroyOnClose
                    footer={null}
                    onCancel={() => {
                      setSnapMoreOpen(false);
                    }}
                    css={{
                      zIndex: 300,
                    }}
                    bodyStyle={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingTop: 46,
                    }}>
                    <SnapMoreMarker
                      showSnap={showSnap}
                      multiple={multiple}
                      maxCount={maxCount - files?.length}
                      handleRemove={handleRemove}
                      handleBeforeUpload={handleBeforeUpload}
                      files={files}
                    />
                  </Modal>
                </>
              )}
            </TabPane>
          ))}
        </Tabs>
      )}

      {files?.length === 0 && (
        <SnapMoreMarker
          showSnap={showSnap}
          multiple={multiple}
          maxCount={maxCount}
          handleRemove={handleRemove}
          handleBeforeUpload={handleBeforeUpload}
          files={files}
          style={{
            width: '60vw',
            minHeight: '50vh',
            height: '100%',
          }}
        />
      )}
    </>
  );
}

function SnapMoreMarker({
  style = {},
  showSnap,
  multiple,
  maxCount,
  handleRemove,
  handleBeforeUpload,
  files,
}: any) {
  const { t } = useTranslation();

  return (
    <Space
      direction='vertical'
      align='center'
      size={[0, 18]}
      css={{
        padding: 8,
        ...style,
        justifyContent: 'center',
        border: '2px dashed var(--hot-color)',
        '&:active, &:hover': {
          border: '2px solid var(--hot-color)',
        },
      }}>
      <Button
        onClick={showSnap}
        type='link'
        css={{
          width: '100%',
          height: 'auto',
          background: '#fafafa',
          border: '1px dashed #d9d9d9',
          borderRadius: '2px',
          transition: 'border-color 0.3s',
          '&:active, &:hover': {
            borderColor: 'var(--active-color)',
          },
        }}>
        <Space
          direction='vertical'
          align='center'>
          <CameraOutlined
            css={{
              fontSize: '2rem',
              color: 'var(--active-color)',
            }}
          />

          <Typography.Paragraph
            css={{
              fontSize: '1.2rem',
              textAlign: 'center',
              whiteSpace: 'normal',
              '@media (max-width: 532px)': {
                fontSize: '0.8rem',
              },
            }}>
            {t('common.take-photo-button')}
          </Typography.Paragraph>
        </Space>
      </Button>

      <Divider style={{ width: 146 }}>{t('common.or')}</Divider>

      <Upload.Dragger
        name='file'
        showUploadList={false}
        multiple={multiple}
        maxCount={maxCount}
        //onChange={handleChange}
        onRemove={handleRemove}
        beforeUpload={handleBeforeUpload}
        fileList={files}
        accept='image/*'
        capture={false}>
        <Button
          block
          type='link'
          css={{ width: '90%', height: 'auto' }}>
          <Space direction='vertical'>
            <InboxOutlined
              css={{
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--active-color)',
              }}
            />

            <Typography.Paragraph
              css={{
                fontSize: '1.2rem',
                textAlign: 'center',
                whiteSpace: 'normal',
                '@media (max-width: 532px)': {
                  fontSize: '0.8rem',
                },
              }}>
              {t('common.upload-image-button')}
            </Typography.Paragraph>
          </Space>
        </Button>
      </Upload.Dragger>
    </Space>
  );
}

export function MkUpload3f({
  multiple = false,
  maxCount = 1,
  onChange,
  compiling,
  activity,
  markerImages,
}: any) {
  const { size } = useThree();
  const setStatus = useStore((state) => state.editorSlice.setStatus);

  const halfWidth = size.width / 2;
  const halfHeight = size.height / 2;

  const { t } = useTranslation();

  useEffect(() => {
    setStatus(EditorStatus.Marker);
  }, []);

  return (
    <>
      {compiling && <Spinner3f tip={t('common.loading')} />}

      <Html
        center
        zIndexRange={[1, 1]}
        css={{
          display: 'flex',
          alignItems: 'center',
          '> span': {
            width: halfWidth,
            height: halfHeight,
          },
        }}>
        <MkUpload
          activity={activity}
          multiple={multiple}
          maxCount={maxCount}
          onChange={onChange}
          compiling={compiling}
          size={size}
          markerImages={markerImages}
        />
      </Html>
    </>
  );
}
