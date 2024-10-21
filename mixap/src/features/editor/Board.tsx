import React, {
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import css from '../../index.css';
import * as ReactDOM from 'react-dom';

import {
  Button,
  Layout,
  Steps,
  Space,
  Typography,
  message,
  Divider,
} from 'antd';
import Icon from '@ant-design/icons';

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  HomeOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import CameraswitchOutlinedIcon from '@mui/icons-material/CameraswitchOutlined';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useStore from '../../hooks/useStore';
import useLogger from '../../hooks/useLogger';
import { useMkUpload } from '../../hooks/useMkCompiler';

import { ActivityDocType } from '../../db/types';
import { Palette } from './Palette';
import { activitySteps } from '../activity/activitySteps';
import { EditorStatus } from './slice';
import { BoardCanvas } from './BoardCanvas';
import { ActivityType } from '../activity/ActivityType';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { useTranslation } from 'react-i18next';
import Modal from 'antd/es/modal/Modal';
import { unique } from '@tensorflow/tfjs';

const { Header, Content, Footer } = Layout;
const { Step } = Steps;

var markersStats;
let areMarkersGoodEnough;
let markerRankingThreshold = 4;
let featureThreshold = 2.5;

export enum AuraMode {
  ARVIEW = 'ARVIEW',
  ARCANVAS = 'ARCANVAS',
  CANVAS = 'CANVAS',
}

const Stars = ({ score }) => {
  return (
    <div>
      <span className='title'></span>
      {[...Array(5).keys()].map((i) => {
        return (
          <span key={i}>
            {score > i && <StarFilled></StarFilled>}
            {score <= i && <StarOutlined />}
          </span>
        );
      })}
    </div>
  );
};

const Warning = ({ fill, unique, dimensions, overallRating }) => {
  const { t } = useTranslation();
  let fillWarning;
  let uniqueWarning;
  let dimensionsWarning;
  let startWarning;

  if (fill * 5 < featureThreshold) {
    startWarning = t('common.marker-features-warningStart');
    fillWarning = t('common.marker-features-fillTip');
  }
  if (unique * 5 < featureThreshold) {
    startWarning = t('common.marker-features-warningStart');
    uniqueWarning = t('common.marker-features-uniqueTip');
  }
  if (dimensions * 5 < featureThreshold) {
    startWarning = t('common.marker-features-warningStart');
    dimensionsWarning = t('common.marker-features-dimensionsTip');
  }
  if (
    dimensions * 5 > featureThreshold &&
    unique * 5 > featureThreshold &&
    fill * 5 > featureThreshold
  ) {
    startWarning = t('common.marker-features-success');
  }

  return (
    <p style={{ color: 'blue' }}>
      <span style={{ color: 'black', fontWeight: 'bold' }}>
        {startWarning && startWarning}
      </span>
      {startWarning && <br />}
      {fillWarning}
      {fillWarning && <br />}
      {uniqueWarning}
      {uniqueWarning && <br />}
      {dimensionsWarning}
    </p>
  );
};

const Stats = ({ statsArray }) => {
  const { t } = useTranslation();

  return (
    <div>
      {statsArray.map((element, index) => (
        <div>
          <div
            key={index}
            style={{ display: 'inline-flex' }}>
            <img
              src={element.resultImage.currentSrc}
              style={{ width: '50%' }}></img>
            <div style={{ width: '50%', textAlign: 'center' }}>
              <p>
                {t('common.marker-features-score')}
                {/*(element.overallRating * 5).toFixed(1)*/}
              </p>
              <Stars score={(element.overallRating * 5).toFixed(1)}></Stars>
            </div>
          </div>
          <Warning
            fill={element.fill}
            unique={element.unique}
            dimensions={element.dimensions}
            overallRating={element.overallRating}
          />
          <Divider />
        </div>
      ))}
    </div>
  );
};

export function Board({ activity }: { activity: Partial<ActivityDocType> }) {
  const log = useLogger('EditorBoard');
  const resultImageRef = useRef<any>();

  log.debug('Render');

  const { id, type, markerFile, markerImages, markerImagesCfg } =
    activity as any;

  const canvasRef = useRef<any>();
  const auraPlayRef = useRef<any>();
  const time = useRef<number>(0);

  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const status = useStore((state) => state.editorSlice.status);
  const switchCamera = auraPlayRef?.current?.switchCamera;

  let isMarkerGoodEnough;

  const { trace } = useTrace({});

  const { t } = useTranslation();

  const {
    onChange: onMkUpload,
    compiling,
    cropping,
    compileMarker,
    setCompiling,
  } = useMkUpload({ activityId: activity.id });

  useEffect(() => {
    time.current = Date.now();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showMarkerFeaturesModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    if (status) {
      next();
      setTimeout(() => {
        setCompiling(false);
      }, 1000);
    } else {
      message.warning(t('common.error-message-retry'));
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setCompiling(false);
    }, 1);
  };

  const next = () => {
    setCurrent(current + 1);

    // enter current + 1
    handleEnterTrace(steps, current + 1);

    // exit current
    handleExitTrace(steps, current, Date.now() - time.current);
  };

  const prev = () => {
    setCurrent(current - 1);

    // exit current
    handleExitTrace(steps, current, Date.now() - time.current);
    // enter current - 1
    handleEnterTrace(steps, current - 1);
  };

  const steps = activitySteps({
    id,
    type,
    activity,
    onMkUpload,
    compiling,
    markerImages,
    markerImagesCfg,
    canvasRef,
    auraPlayRef,
  });

  const handleEnterTrace = (steps, current) => {
    const step = steps[current];

    let type;
    switch (step.title) {
      case t('common.step-naming'): {
        type = TRACES.ENTER_NAMING_STEP;
        break;
      }
      case t('common.step-marker'): {
        type = TRACES.ENTER_MARKER_STEP;
        break;
      }
      case t('common.step-augmentation'): {
        type = TRACES.ENTER_AURA_STEP;
        break;
      }
      case t('common.step-trial'): {
        type = TRACES.ENTER_TRY_STEP;
        break;
      }
      case t('common.step-success'): {
        type = TRACES.ENTER_SUCCESS_STEP;
        break;
      }
      case t('common.step-failure'): {
        type = TRACES.ENTER_FAILURE_STEP;
        break;
      }
      case t('common.step-selection'): {
        type = TRACES.ENTER_SELECT_STEP;
        break;
      }
      case t('common.step-arrangement'): {
        break;
      }
    }

    trace(type);
  };

  const handleExitTrace = (steps, current, duration) => {
    const step = steps[current];
    let type;

    switch (step.title) {
      case t('common.step-naming'): {
        type = TRACES.EXIT_NAMING_STEP;
        break;
      }
      case t('common.step-marker'): {
        type = TRACES.EXIT_MARKER_STEP;
        break;
      }
      case t('common.step-augmentation'): {
        type = TRACES.EXIT_AURA_STEP;
        break;
      }
      case t('common.step-trial'): {
        type = TRACES.EXIT_TRY_STEP;
        break;
      }
      case t('common.step-success'): {
        type = TRACES.EXIT_SUCCESS_STEP;
        break;
      }
      case t('common.step-failure'): {
        type = TRACES.EXIT_FAILURE_STEP;
        break;
      }
      case t('common.step-selection'): {
        type = TRACES.EXIT_SELECT_STEP;
        break;
      }
      case t('common.step-arrangement'): {
        type = TRACES.EXIT_ARRANGE_STEP;
        break;
      }
    }

    trace(type, { duration: duration });
    time.current = Date.now();
  };

  const {
    useCanvas = true,
    useMarkerCompiler = false,
    isValidStep = true,
  } = steps[current];

  // if (isObjectPreview) {
  //   ReactDOM.render(<ObjectViewer />, document.getElementById('root'));
  // }

  return (
    <Layout
      style={{
        overflowY: 'hidden',
        width: '100%',
        height: '100%',
        background: 'none',
      }}>
      {/* {status === EditorStatus.Tracking && isObjectPreview && <ObjectViewer />} */}

      <Content
        id='board-content'
        style={{
          width: 'calc(100% -64px)',
          height: '100%',
          padding: 2,
        }}>
        <Header
          draggable={false}
          css={{
            background: 'none',
            height: 32,
            padding: '0px 18px',
            marginBottom: 4,
            '> *': {
              userSelect: 'none',
            },
            '@media (max-width: 532px)': {
              padding: '0',
            },
          }}>
          <Steps
            direction='horizontal'
            responsive={false}
            current={current}
            onChange={(value) => {
              setCurrent(value);
            }}
            css={{
              '@media (max-width: 532px)': {
                '& .ant-steps-item-container': {
                  transform: 'scale(0.5)',
                },
              },
            }}
            items={steps}></Steps>
        </Header>

        {useCanvas ? (
          <BoardCanvas ref={canvasRef}>
            <Palette meta={steps[current]?.meta || {}} />
            {steps[current].content}
          </BoardCanvas>
        ) : (
          <>{steps[current].content}</>
        )}

        {status && (
          <Modal
            open={isModalOpen}
            title={t('common.marker-features-title')}
            onCancel={handleCancel}
            footer={
              <Space
                direction='horizontal'
                style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  size='middle'
                  shape='round'
                  style={{ margin: '0 8px' }}
                  onClick={handleCancel}>
                  {t('common.previous')}
                </Button>
                <Button
                  size='middle'
                  shape='round'
                  style={{ margin: '0 8px' }}
                  onClick={handleOk}>
                  {t('common.next')}
                </Button>
              </Space>
            }>
            <Stats statsArray={markersStats} />
            {/* <a href="https://www.mindar.org/how-to-choose-a-good-target-image-for-tracking-in-ar-part-4/" target="_blank">{t('common.marker-features-infoLink')}</a> */}
            <h3>{t('common.marker-features-question')}</h3>
          </Modal>
        )}

        <Footer
          draggable={false}
          css={{
            padding: 16,
            background: 'none',
            '*': {
              userSelect: 'none',
              userDrag: 'none',
            },
          }}>
          <Space
            direction='horizontal'
            style={{ width: '100%', justifyContent: 'flex-end' }}>
            {current > 0 && (
              <Button
                icon={<ArrowLeftOutlined />}
                size='middle'
                shape='round'
                style={{ margin: '0 8px' }}
                onClick={prev}>
                {t('common.previous')}
              </Button>
            )}

            {useMarkerCompiler && (
              <Button
                key='upload'
                size='middle'
                shape='round'
                type='primary'
                disabled={
                  !markerImages ||
                  markerImages?.length === 0 ||
                  (activity.type === ActivityType.Association &&
                    markerImages?.length !== 2) ||
                  compiling ||
                  cropping
                }
                // loading={compiling}
                icon={<ArrowRightOutlined />}
                onClick={async () => {
                  // a compiled marker already there or
                  // no need for a marker
                  if (markerFile) {
                    next();
                    return;
                  }

                  // a new marker
                  setCompiling(true);
                  const tempStats = await compileMarker();
                  markersStats = tempStats;
                  log.debug('compilerStatus', markersStats);
                  let goodMarkerCount = 0;
                  markersStats.map((element) => {
                    if (element.overallRating * 5 > markerRankingThreshold) {
                      goodMarkerCount++;
                    }
                  });
                  if (goodMarkerCount == markersStats.length) {
                    handleOk();
                  } else {
                    showMarkerFeaturesModal();
                  }
                }}>
                {t('common.next')}
              </Button>
            )}

            {current < steps.length - 1 && !useMarkerCompiler && (
              <Button
                icon={<ArrowRightOutlined />}
                size='middle'
                shape='round'
                type='primary'
                disabled={!isValidStep}
                onClick={() => {
                  next();
                }}>
                {t('common.next')}
              </Button>
            )}

            {status === EditorStatus.Tracking && (
              <Button
                key='switch'
                size='middle'
                shape='round'
                icon={<CameraswitchOutlinedIcon />}
                onClick={switchCamera}>
                {t('common.camera')}
              </Button>
            )}

            {current === steps.length - 1 && (
              <Button
                key='home'
                shape='circle'
                type='primary'
                size='large'
                onClick={() => {
                  navigate(-1);
                }}
                icon={<HomeOutlined />}
              />
            )}
          </Space>
        </Footer>
      </Content>
    </Layout>
  );
}

export function Scan({ children }: { children: any }) {
  const { size } = useThree();

  return (
    <Html
      center
      style={{
        width: size.width / 2,
        height: size.height / 2,
        top: -46,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {children}
    </Html>
  );
}
