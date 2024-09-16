import React, { useEffect, useState }from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Space, Typography, Button, Card, Divider, Row, Col, Tabs, Layout, Flex } from 'antd';

import { PlusOutlined, AntDesignOutlined, FolderOutlined , UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import '../../assets/css/pages/bibliotheque.scss';
import '../../assets/css/pages/cards.scss';
import '../../assets/css/pages/filtres.scss';
import '../../assets/css/pages/listing.scss';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react'; 

import PageHeader from '../navigation/PageHeader';
import useStore from '../../hooks/useStore';
import useInstall from '../../hooks/useInstall';
//import GirdCenter from '../../components/GridCenter';
import { ActivityDocType, RxColOp } from '../../db/types';
import { useActivity } from '../../hooks';
import  ActivityDescription  from '../activity/ActivityDescription';

import  GroupDescription  from '../activity/GroupDescription';
import  PathDescription  from '../activity/PathDescription';
import { ActivityCard } from '../activity/ActivityCard';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';
import { useTranslation } from 'react-i18next';
import { ActivityType } from '../../features/activity/ActivityType';

import { getID } from '../../utils/uniqueId';
import { activityTypeList} from '../activity/ActivityType';


import ActivityFilters, {init} from "../activity/ActivityFilters";


const IconLink = ({
  icon,
  text,
  onClick,
}: {
  icon: any;
  text: string;
  onClick?: () => void;
}) => (
  <Button
    onClick={onClick}
    css={{
      display: 'flex',
    }}
    type='text'
    size='large'>
    <Button
      css={{
        color: 'var(--primary-color)',
        marginRight: 4,
      }}
      type='default'
      icon={icon}
      shape='circle'
    />
    <Typography.Link style={{ fontSize: 18 }}>{text}</Typography.Link>
  </Button>
);

const HeaderContent = ({ onInstall, showInstall }: any) => {
  const { t } = useTranslation();
  return (
    <Space
      direction='vertical'
      css={{
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        margin: 'auto',
      }}>
      <Typography.Text css={{ fontSize: '1rem' }}>
        <Typography.Text strong>MIXAP</Typography.Text>{' '}
        {t('common.description-part1')}{' '}
        <Typography.Link
          rel='noopener noreferrer'
          href='https://lium.univ-lemans.fr/'
          target='_blank'
          strong>
          {'LIUM'}
        </Typography.Link>
        {t('common.description-part2')}{' '}
        <Typography.Text strong>
          {t('common.augmented-reality')}
        </Typography.Text>
        {t('common.description-part3')}{' '}
        <Typography.Text strong>{t('common.teachers')}</Typography.Text>.{' '}
        {t('common.description-part4')}
        <br></br>
        {t('common.description-part5')}{' '}
        <Typography.Link
          rel='noopener noreferrer'
          href='https://mixap-lium.univ-lemans.fr/'
          target='_blank'
          strong>
          {'MIXAP'}
        </Typography.Link>
        {t('common.description-part6')}
      </Typography.Text>
    </Space>
  );
};

export default function Home() {
  const activities = useStore((state) => state.activitySlice.activities);
  const showMenu = useStore((state) => state.activitySlice.showMenu);
  const { trace } = useTrace({});
  const { onInstall, shoudldInstall } = useInstall();
  const navigate = useNavigate();



  const locationNavigate = useLocation();

  
  const ancreTab = locationNavigate.state?.ancre;

  const { Content } = Layout;

  //Permet de savoir sur quelle Tab ce mettre
  const [activeKey, setActiveKey] = React.useState(ancreTab === 'group' || ancreTab === 'path' ? ancreTab : 'activity')
  
  //Change de Tab pour pouvoir revenir sur celle sélectionnée
  const onKeyChange = (key) => {
    if(locationNavigate.state !== null){
      locationNavigate.state.ancre = key;
    } else {
      locationNavigate.state = {'ancre':key};
    }
    setActiveKey(key);
    
  }
  

  const { onRxColActivity } = useActivity();

  const handlePlay = (activityId) => {
    onRxColActivity(RxColOp.SetCurrActivity, {
      id: activityId,
    });

    navigate(`/play-activity/${activityId}/${activeKey}`);
  };


  const handleAddActivity = () => {
    showMenu();
    trace(TRACES.ADD_ACTIVITY_CTA);
  };

  const user = useStore((state) => state.authSlice.user);

  //Permet de créer un groupe "d'activité" ou un "parcours" lors du clic sur le bouton
  const handleAddGroups = (type: string) => {
    showMenu();
    trace(TRACES.ADD_ACTIVITY_CTA);
  };

  const handleAddPath = (type: string) => {
    
    const id = getID();
    onRxColActivity(RxColOp.Add, {
      id,
      type: type,
      title: t(activityTypeList[type].placeholders.title) as string,
      instruction: t(
        activityTypeList[type].placeholders.instruction,
      ) as string,
      description: t(
        activityTypeList[type].placeholders.description,
      ) as string,
      userId: user?.id,
    });

    navigate(`/edit-activity/${id}/${activeKey}`);
    
    trace(TRACES.ADD_ACTIVITY_CTA);
  };


  const cards = activities.map((activity: ActivityDocType) => (
    
    <ActivityCard
      activity={activity}
      key={activity.id}
      onCardClick={handlePlay.bind(activity.id)}
      tabKey={activeKey}
    />
  ));


  const cardsActivities: any[] = [];
  if(cards.length > 0)
  {
    cards.forEach((item) => {
      if(item.props.activity.type === ActivityType.Validation ||
      item.props.activity.type === ActivityType.Augmenter ||
      item.props.activity.type === ActivityType.Augmentation ||
      item.props.activity.type === ActivityType.Superposition ||
      item.props.activity.type === ActivityType.Association
      ){
        cardsActivities.push(item);
      }
    });
  }

  const cardsGroups: any[] = [];
  if(cards.length > 0)
  {
    cards.forEach((item) => {
      if(item.props.activity.type === ActivityType.Group || item.props.activity.type === ActivityType.SmartGroup){
        cardsGroups.push(item);
      }
    });
  }

  const cardsPaths: any[] = [];
  if(cards.length > 0)
  {
    cards.forEach((item) => {
      if(item.props.activity.type === ActivityType.Path ){
        cardsPaths.push(item);
      }
    });
  }

  const { t } = useTranslation();



  const cards2listSwitcher = document.getElementById('switchList');
  cards2listSwitcher?.addEventListener('click', cards2list);

  function cards2list(e){
    e.stopPropagation();
    document.body.classList.add('-listing');
    noCardsTransition();
  }

  const list2cardsSwitcher = document.getElementById('switchCards');
  list2cardsSwitcher?.addEventListener('click', list2cards);

  function list2cards(e){
    e.stopPropagation();
    document.body.classList.remove('-listing');
    noCardsTransition();
  }

  function noCardsTransition(){
    document.body.classList.add('-noCardsTransition');
    
    
    setTimeout(() => {
      document.body.classList.remove('-noCardsTransition');
    }, 1000);
  }

  //Permet de rendre fonctionnel le web component ActivityFilters
  init(['-augmenter','-valider','-associer','-superposer','-exploiter'],
    ['#filtreAugmenter','#filtreValider','#filtreAssocier','#filtreSuperposer','#filtreExploiter'],
    'resetFiltres'
  );


  return (
    // <Space
    //   direction='vertical'
    //   css={{ width: '100%', height: '100%', overflowY: 'auto' }}>
    <Layout className='mix-app'>   
      
      <PageHeader
        route='/'
        content={
          <HeaderContent
            onInstall={onInstall}
            showInstall={shoudldInstall}
          />
        }
      />
      <div className='mix-spacer' />
      <section className="mix-main" >
        
      
        <section className='mix-main_content'>

          <div id="switchList" className="mix-switcher">
            <Tooltip title={t('common.display-as-list')} placement="bottomRight">
              <span className="mix-switcher_bt -active"><AppstoreOutlined /></span>
              <span className="mix-switcher_bt"><UnorderedListOutlined /></span>
            </Tooltip>
          </div>
          <div id="switchCards" className="mix-switcher">
            <Tooltip title={t('common.display-as-cards')} placement="bottomRight">
              <span className="mix-switcher_bt"><AppstoreOutlined /></span>
              <span className="mix-switcher_bt -active"><UnorderedListOutlined /></span>
            </Tooltip>
          </div>

        
          
          <Tabs tabBarExtraContent={{ left : <Typography.Title level={4}>{t('common.my-library')}</Typography.Title> }} activeKey={activeKey} onChange={onKeyChange} items={
              [

                {
                  key: 'activity', 
                  label: <span>{t('common.activity')} <span className='mix-tab_qte'>{cardsActivities.length}</span></span>,
                  children:
                  <Content className='mix-appWrap -activities'>
                    <Row className='mix-main'>

                      <Col className='mix-main_aside'>
                        <div className='mix-spacer' />
                        <ActivityDescription />
                        <Button
                          size='large'
                          type='primary'
                          shape='round'
                          css={{
                            fontWeight: 500,
                            margin: 'auto',
                          }}
                          icon={<PlusOutlined css={{ fontSize: 22, color: '#eee' }} />}
                          onClick={handleAddActivity}>
                          {t('common.activity')}
                        </Button>

                      </Col>
                      
                      <Col className='mix-main_content -activities'>
                        <div className='mix-spacer' />

                        <ActivityFilters/>

                        <div className='mix-spacer' />
                        <Flex wrap gap="middle" className='mix-main_content_item'>
                        {cardsActivities}
                        </Flex>

                      
                        
                      </Col>

                    </Row>
                  </Content>,

                  icon: <AntDesignOutlined/>
                },
                {
                  key: 'group',
                  label: <span>{t('common.group-placeholder-title')} <span className='mix-tab_qte'>{cardsGroups.length}</span></span>,
                  children:

                  <Content className='mix-appWrap'>
                    <Row className='mix-main'>
                      <Col className='mix-main_aside'>
                        <div className='mix-spacer' />
                        <GroupDescription />
                        <Button
                          size='large'
                          type='primary'
                          shape='round'
                          css={{
                            fontWeight: 500,
                            margin: 'auto',
                          }}
                          icon={<PlusOutlined css={{ fontSize: 22, color: '#eee' }} />}
                          onClick={() => handleAddGroups(ActivityType.Group)}>
                          {t('common.create-group')}
                        </Button>
                      </Col>
                    
                      <Col className='mix-main_content'>
                        <div className='mix-spacer' />
                        <div className='mix-spacer' />
                        <Flex wrap gap="middle" >
                          {cardsGroups}
                        </Flex>
                      </Col>

                    </Row>
                  </Content>,
                  icon: <FolderOutlined/>
                },
                {
                  key: 'path',
                  label: <span>{t('common.path-title')} <span className='mix-tab_qte'>{cardsPaths.length}</span></span>,
                  children:
                  <Content className='mix-appWrap'>
                    <Row className='mix-main'>
                      <Col className='mix-main_aside'>
                        <div className='mix-spacer' />
                        <PathDescription />
                        <Button
                          size='large'
                          type='primary'
                          shape='round'
                          css={{
                            fontWeight: 500,
                            margin: 'auto',
                          }}
                          icon={<PlusOutlined css={{ fontSize: 22, color: '#eee' }} />}
                          onClick={() => handleAddPath(ActivityType.Path)}>
                          {t('common.create-path')}
                        </Button>
                      </Col>
                      
                      <Col className='mix-main_content'>
                        <div className='mix-spacer' />
                        <div className='mix-spacer' />
                        <Flex wrap gap="middle" >
                        {cardsPaths}
                        </Flex>
                      </Col>

                    </Row>
                  </Content>,
                  icon: <FolderOutlined/>
                },
              ]
              }>
            
          </Tabs>
        </section>
      </section>
      
    </Layout>  
    // </Space>
  );
}
