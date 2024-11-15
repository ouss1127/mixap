import React, { useCallback, useEffect, useState } from 'react';
import {
  Menu,
  Dropdown,
  Button,
  Row,
  message,
  Typography,
  Popover,
  Space,
  Input,
  Modal,
  Select,
  Divider,
  notification,
  Spin,
  Col,
  Tag,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { useNavigate } from 'react-router-dom';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import AppSettingsAltIcon from '@mui/icons-material/AppSettingsAlt';
import PermCameraMicOutlinedIcon from '@mui/icons-material/PermCameraMicOutlined';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import {
  CheckOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  HomeOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import logo from '../../logo.png';
import { useRequestLocalStream } from '../arview/utils';
import { useSync } from '../../hooks/useSync';
import useStore from '../../hooks/useStore';
import { version } from '../../version.js';
import supabase from 'src/db/supabase';
import useLogger from 'src/hooks/useLogger';
import { getCode } from 'src/utils/uniqueId';
import { useTranslation } from 'react-i18next';
import Lang from '../../components/Lang';
import { QRScanner } from 'src/components/QRScanner';
import { QRView } from 'src/components/QRView';

const MenuItems = () => {
  const user = useStore((state) => state.authSlice.user);

  const { t } = useTranslation();

  const requestStream = useRequestLocalStream();

  return (
    <Menu
      items={[
        {
          label: <>{t('common.allow-camera-microphone')}</>,
          key: '1',
          icon: <PermCameraMicOutlinedIcon />,
          onClick: requestStream.bind(null, message),
        },
        {
          label: (
            <>
              <Typography.Text>{t('common.device-code-copy')}</Typography.Text>{' '}
              <Typography.Text
                strong
                copyable={{
                  tooltips: ['', t('common.device-code-copied')],
                }}>
                {user?.id}
              </Typography.Text>
            </>
          ),
          key: '2',
          icon: <PermIdentityOutlinedIcon />,
        },
        {
          label: `MIXAP version v${version}`,
          key: '3',
          icon: <AppSettingsAltIcon />,
        },
      ]}
    />
  );
};

const DropdownMenu = () => {
  return (
    <Dropdown
      arrow
      key='more'
      overlay={<MenuItems />}
      placement='bottomRight'>
      <Button
        shape='circle'
        icon={<MoreOutlined style={{ fontSize: 20 }} />}
      />
    </Dropdown>
  );
};

const Content = ({ children, extraContent }: any) => (
  <Row>
    <div style={{ flex: 1 }}>{children}</div>
    <div className='image'>{extraContent}</div>
  </Row>
);

export default function Header({
  content = null,
}: {
  route?: string;
  content: any;
}) {
  const navigate = useNavigate();
  const { onPull } = useSync();
  const [userId, setUserId] = useState<string>('');
  const showPushModal = useStore((state) => state.activitySlice.showPushModal);
  const showQRScannerModal = useStore(
    (state) => state.activitySlice.showQRScannerModal,
  );
  const user = useStore((state) => state.authSlice.user);
  const currActitityId = useStore(
    (state) => state.activitySlice.currActitityId,
  );

  const { t } = useTranslation();

  const handleUserId = (e) => {
    setUserId(e.target.value);
  };

  return (
    <PageHeader
      title={
        <Typography.Text
          css={{ fontFamily: 'Quicksand', cursor: 'pointer' }}
          onClick={() => {
            navigate('/library');
          }}>
          <img
            css={{ width: 115, height: 42 }}
            src={logo}
          />
        </Typography.Text>
      }
      extra={[
        <Lang key='lang' />,
        <Button
          key='scan'
          icon={<QrCodeScannerIcon />}
          onClick={showQRScannerModal}
          shape='round'
        />,
        <Popover
          key='pull'
          title={t('common.sharing-code')}
          placement='bottom'
          content={
            <Space
              direction='vertical'
              style={{ padding: 18 }}>
              <Input
                size='large'
                onChange={handleUserId}
              />
              <Button
                disabled={userId?.length < 6}
                icon={<CheckOutlined />}
                onClick={onPull.bind(null, userId)}
                shape='round'
                type='primary'
                css={{ marginLeft: 'auto' }}>
                {t('common.validate')}
              </Button>
            </Space>
          }>
          <Button
            key='pull'
            icon={<CloudDownloadOutlined />}
            shape='round'
          />
        </Popover>,
        <Button
          key='push'
          icon={<CloudUploadOutlined />}
          onClick={showPushModal}
          shape='round'
        />,
        <DropdownMenu key='more' />,
      ]}>
      {content ? <Content>{content}</Content> : null}

      <SyncPush />
      <QRScanner />
      <QRView
        userId={user?.id}
        activityId={currActitityId}
      />
    </PageHeader>
  );
}

{/*<Button
          key='dashboard'
          shape='round'
          color='#000'
          icon={<HomeOutlined />}
          onClick={() => {
            navigate('/dashboard');
          }}>
          {t('common.dashboard')}
        </Button>*/}

const SyncPush = () => {
  const log = useLogger('SyncPush');

  const { onPush } = useSync();
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [title, setTitle] = useState('');
  const [auth, setAuth] = useState('reader');
  const [selected, setSelected] = useState();
  const user = useStore((store) => store.authSlice.user);
  const openPushModal = useStore((state) => state.activitySlice.openPushModal);
  const hidePushModal = useStore((state) => state.activitySlice.hidePushModal);

  const { t } = useTranslation();

  log.debug('open', openPushModal);

  useEffect(() => {
    (async () => {
      if (!user?.id) {
        log.warn('user is undefined!!');
        return;
      }

      const { data: dataAuths, error: errAuths } = await supabase
        .from('Authorization')
        .select()
        .eq('userId', user?.id);

      log.debug('dataAuths', errAuths, dataAuths);

      setItems(dataAuths || []);
    })();
  }, [user]);

  const onTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [],
  );

  const addItem = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      e.preventDefault();

      if (!title || !auth) {
        notification.warning({
          message: t('common.empty-name-code'),
        });
        return;
      }

      notification.info({
        message: (
          <Typography.Text>
            {t('common.saving')}
            {'  '}
            <Spin />
          </Typography.Text>
        ),
        key: 'sync-menu',
        duration: 0,
      });

      const { data: data, error: err } = await supabase
        .from('Authorization')
        .insert({
          userId: user?.id,
          title: title,
          auth: auth,
          token: getCode(),
        });

      if (err) {
        notification.error({
          message: t('common.saving-failed'),
          description: t('common.error-message-retry'),
          key: 'sync-menu',
          duration: 3,
        });
      } else {
        notification.success({
          message: t('common.saving-success'),
          key: 'sync-menu',
          duration: 3,
        });
      }

      if (data?.length) {
        setItems(() => [...items, ...data]);
      }

      // setItems([...items, name || `New item ${index++}`]);
      setTitle('');
      setAuth('reader');
    },
    [user, title, auth],
  );

  return (
    <Modal
      title={t('common.general-access')}
      visible={openPushModal}
      footer={
        <Space>
          <Button
            shape='round'
            onClick={hidePushModal}>
            {t('common.cancel')}
          </Button>
          <Button
            type='primary'
            shape='round'
            disabled={!selected}
            onClick={onPush.bind(null, selected)}>
            {t('common.send')}
          </Button>
        </Space>
      }
      onCancel={hidePushModal}>
      <Space
        direction='vertical'
        css={{ width: '100%' }}>
        <Typography.Text style={{ margin: 0 }}>
          {t('common.share-code-instruction')}
        </Typography.Text>

        <Select
          css={{ width: '100%' }}
          placeholder={t('common.share-code-placeholder')}
          optionLabelProp='label'
          onChange={setSelected}
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: '8px 0' }} />
              <Space style={{ padding: '0 8px 4px' }}>
                <Input
                  placeholder={t('common.code-name-placeholder') as string}
                  value={title}
                  onChange={onTitleChange}
                />
                <Select
                  placeholder="Droits d'accès"
                  defaultValue='reader'
                  style={{ width: 120 }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onChange={setAuth}
                  options={[
                    { value: 'editor', label: t('common.editor') },
                    { value: 'reader', label: t('common.reader') },
                  ]}
                />
                <Button
                  type='text'
                  icon={<PlusOutlined />}
                  onClick={addItem}>
                  {t('common.new-code')}
                </Button>
              </Space>
            </>
          )}>
          {items?.map((option) => (
            <Select.Option
              key={option.id}
              value={option.token}
              label={
                <>
                  <TitleTag option={option} /> <AccessTag option={option} />{' '}
                  <TokenTag option={option} />
                </>
              }>
              <Row>
                <Col span={8}>
                  <Tag>{option.title}</Tag>
                </Col>
                <Col span={8}>
                  <AccessTag option={option} />
                </Col>
                <Col span={8}>
                  <Tag>
                    <Typography.Text
                      strong
                      copyable={{
                        tooltips: ['', t('common.device-code-copied')],
                      }}>
                      {option.token}
                    </Typography.Text>
                  </Tag>
                </Col>
              </Row>
            </Select.Option>
          ))}
        </Select>
      </Space>
    </Modal>
  );
};

const AccessTag = ({ option }) => {
  return (
    <Tag color={option.auth === 'reader' ? 'volcano' : 'magenta'}>
      {option.auth === 'reader' ? 'Lecteur' : 'Editeur'}
    </Tag>
  );
};

const TitleTag = ({ option }) => {
  return <Tag>{option.title}</Tag>;
};

const TokenTag = ({ option }) => {
  const { t } = useTranslation();

  return (
    <Tag
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}>
      {' '}
      <Typography.Text
        strong
        copyable={{
          tooltips: ['', t('common.device-code-copied')],
        }}>
        {option.token}
      </Typography.Text>
    </Tag>
  );
};
