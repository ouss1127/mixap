import React from 'react';
import { Space, Typography, Dropdown, notification, Button, Menu , Layout , Row, Col ,Flex } from 'antd';

const { Header, Footer, Sider, Content } = Layout;


import '../../assets/css/pages/details/details-page.scss';
import '../../assets/css/components/actions.scss';
// import '../../assets/css/pages/cards.scss';
// import '../../assets/css/pages/filtres.scss';
// import '../../assets/css/pages/listing.scss';

import PageHeader from '../navigation/PageHeader';
import { useParams, useNavigate } from 'react-router-dom';
import { ActivityType, activityTypeList } from './ActivityType';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { useTranslation } from 'react-i18next';
import useStore from '../../hooks/useStore';
import { useActivity } from '../../hooks';
import { ActivityDocType, RxColOp } from '../../db/types';
import ButtonTip from '../../components/ButtonTip';
import { ActivityCard } from '../activity/ActivityCard';

import { 
  EditOutlined, 
  CloudUploadOutlined, 
  QrcodeOutlined, 
  DeleteOutlined, 
  LikeOutlined, 
  EllipsisOutlined, 
  CaretLeftOutlined,
  PlayCircleOutlined
 } from '@ant-design/icons';

import { getCode } from 'src/utils/uniqueId';
import { useSync } from '../../hooks/useSync';

export default function Activity() {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const activities = useStore((state) => state.activitySlice.activities);
  const { t } = useTranslation();
  const { onRxColActivity } = useActivity();
  const { onPushSingleActivity } = useSync();

  const showQRViewModal = useStore(
    (state) => state.activitySlice.showQRViewModal,
  );
  const setCurrActitityId = useStore(
    (state) => state.activitySlice.setCurrActitityId,
  );

  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const tabReturn = document.location.href.endsWith('group') ? 'group' : document.location.href.endsWith('path') ? 'path' : 'activity';


  let cover;
  let activity!: ActivityDocType;

  activities.map((activityParam: ActivityDocType) => {
      if (activityParam.id === id) {
        activity =  activityParam
        cover = activity?.type === ActivityType.Group ? t(activityTypeList[ActivityType.Group].cover) : t(activityTypeList[ActivityType.Path].cover);
      }
  });

   
  
  //Bouton pour éditer le groupe d'activités
  const handleEditLeft = (activityId,e) => {
    e.preventDefault();
    e.stopPropagation();
    onRxColActivity(RxColOp.SetCurrActivity, {
      id: activityId,
    });

    navigate(`/edit-activity/${activityId}/edit`);
  };

  //Bouton pour uploader le groupe d'activités menu gauche
  const handleUploadLeft = (activityId, e ) => {
    const token = getCode();
    onPushSingleActivity(activityId, token);

    e.preventDefault();
    e.stopPropagation();
  };

  //Bouton pour le QrCode menu gauche
  const handleShowQRViewModalLeft = (activityId, e) => {
    e.stopPropagation();
    showQRViewModal();
    setCurrActitityId(activityId);
  };

  //Menu déroulant structure
  const DropdownMenu = ({ activityId }: { activityId: string }) => (
    <Dropdown
      arrow
      key='more'
      overlay={<DropdownContent activityId={activityId} />}
      placement='bottomRight'>
      <Button
        css={btnStyle}
        type='text'
        icon={
          <EllipsisOutlined
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        }
      />
    </Dropdown>
  );

  //Contenu du menu déroulant like + delete
  function DropdownContent({ activityId }: { activityId: string }) {
    const { onRxColActivity } = useActivity();
  
    const { trace } = useTrace({});
  
    const { t } = useTranslation();
  
    const handleDelete = (activityId) => {
      onRxColActivity(RxColOp.Remove, {
        id: activityId,
      });
  
      notification.info({
        message: t('common.activity-recycle-bin'),
        placement: 'bottomLeft',
      });
  
      trace(TRACES.REMOVE_ACTIVITY);
    };
  
    // Contenu Du DropZOne 
    return (
      <Menu
        items={[
          {
            key: 'like',
            label: (
              <ButtonTip
                css={btnStyle}
                tip={t('common.like')}
                type='text'
                onClick={(e) => {
                  e.preventDefault();
                }}
                icon={<LikeOutlined />}
              />
            ),
          },
          {
            key: 'delete',
            onClick: handleDelete.bind(null, activityId),
            label: (
              <ButtonTip
                danger
                tip={t('common.delete')}
                type='text'
                icon={<DeleteOutlined />}
              />
            ),
          },
        ]}
      />
    );
  }


  //Liste des activités du groupe
  const handlePlay = (activityId) => {
    onRxColActivity(RxColOp.SetCurrActivity, {
      id: activityId,
    });

    if(activity.type === ActivityType.Group){
      navigate(`/play-activity/${activityId}/group`);
    } else if(activity.type === ActivityType.Path){
      navigate(`/play-activity/${activityId}/path`);
    } else {
      navigate(`/play-activity/${activityId}/activity`);
    }
    
  };

  //Gerstion des carte du groupes ou parcours
  const cards: any[] = [];
  activities.map((activityParam: ActivityDocType) => {
    activityParam.comboIds?.forEach((idActivity) => {

      if(id === activityParam.id){
        activities.forEach(activityItem => {
        
          if(activityItem.id === idActivity)
          {
            cards.push(
              <ActivityCard activity={activityItem} key={activityItem.id} onCardClick={handlePlay.bind(null, activity.id)}></ActivityCard>
            );
          }
        });
      }
    });
  });

  //Bouton retour vers la Home depuis une groupe ou parcours
  const handleReturn = () => {

    if(activity.type === ActivityType.Group){
      navigate('/',{state:{ancre: tabReturn}});
    } else if(activity.type === ActivityType.Path){
      navigate('/',{state:{ancre: tabReturn}});
    } else {
      navigate('/',{state:{ancre: tabReturn}});
    }
  }
  
  return (
    // <Space
    //   direction='vertical'
    //   style={{ width: '100%', height: '100%' }}
    //   >
    <Layout className='mix-app'>

      <PageHeader
        route='/view-activity'
        content={null}
      />
      
      <Content className='mix-appWrap'>
        <Button
          icon={<CaretLeftOutlined/>}
          onClick={(e) => {
            e.preventDefault();
            handleReturn();
          }}>
          {t('common.return-home')}
        </Button>
        <div className='mix-spacer' />
        <Row className='mix-main'>

          <Col className='mix-main_aside'>

          
            {/* ICONE */}
            <div className='mix-details_ico'>
              <img
                  className='mix-details_icoImg'
                  alt=''
                  src={cover}
                />
              <span className="mix-card_badge">{activity?.type === ActivityType.Group ? t(activityTypeList[ActivityType.Group].title) : t(activityTypeList[ActivityType.Path].title) }</span>
            </div>

            <Typography.Title level={3}>{activity?.title}</Typography.Title>
            <Typography.Text >{activity?.description}</Typography.Text>
            
            
            <div className="mix-spacer"></div>
            
            <Button
              size='large'
              type='primary'
              shape='round'
              css={{
                fontWeight: 500,
                margin: 'auto',
              }}
              icon={<PlayCircleOutlined css={{ fontSize: 22, color: '#eee' }} />}
              onClick={(e) => {
                e.preventDefault();
                handlePlay(activity.id);
              }}>
              {t('common.start')}
            </Button>
           

            <div className="mix-spacer"></div>



            {/* MENU */}
        
            <ul className='mix-actions'>
              <li>
                  <ButtonTip
                  tip={t('common.edit')}
                  key='pen'
                  type='text'
                  onClick= {(e) => {handleEditLeft(id,e)}}
                  icon={<EditOutlined />}
                />
              </li>
              <li>
                <ButtonTip
                  tip={t('common.upload-single-activity')}
                  key='upload'
                  type='text'
                  onClick={handleUploadLeft.bind(null, id)} 
                  icon={<CloudUploadOutlined />}
                />
              </li>
              <li>
                <ButtonTip
                  tip={t('common.show-qr')}
                  key='qr'
                  type='text'
                  icon={<QrcodeOutlined />}
                  onClick={(e) =>{handleShowQRViewModalLeft(id, e)}}
                />

              </li>
              <li>
                <DropdownMenu
                  key='ellipsis'
                  activityId={activity?.id}
                />

              </li>
            </ul>
            

            <div className='mix-identifier'>
              <label>{t('common.identifier')}</label>
  
               <Typography.Title level={5} 
                  className='mix-identifier_nb'
                  copyable={{
                  tooltips: ['', t('common.device-code-copied')],
                }}> {id}</Typography.Title> 
            </div>
            

          </Col>

          <Col className='mix-main_content'>
            <Flex wrap gap="middle" className='mix-main_content_item' >
              {cards}
            </Flex>
          </Col>
        </Row>
      </Content>
    </Layout>
    // </Space>
  );
}

