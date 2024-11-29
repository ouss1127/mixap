// mixap/src/components/MediaModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { t } from 'i18next';
import useStore from '@/hooks/useStore';

const { TabPane } = Tabs;

type Gif = {
  id: string;
  title: string;
  url: string;
  media_formats: {
    gif: {
      url: string;
    };
    [key: string]: any;
  };
};

// type Icon = {
//   id: string;
//   title: string;
//   url: string;
// };

interface MediaModalProps {
  visible: boolean;
  onClose: () => void;
  onImageClick: (imageData: any) => void;
}

const MediaModal: React.FC<MediaModalProps> = ({
  visible,
  onClose,
  onImageClick,
}) => {
  const [gifs, setGifs] = useState<Gif[]>([]);
  // const [icons, setIcons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const API_KEY_TENOR = import.meta.env.VITE_APP_API_TENOR;
  // const API_KEY_ICONFINDER = import.meta.env.VITE_APP_API_ICONFINDER;
  const [localImages, setLocalImages] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      fetchDefaultGifs();
      fetchLocalImages();
    }
  }, [visible]);

  const fetchGifs = async (query: string) => {
    const response = await fetch(
      `https://tenor.googleapis.com/v2/search?q=${query}&key=${API_KEY_TENOR}&limit=46`,
    );
    const data = await response.json();
    console.log('gif', data);
    setGifs(data.results || []);
  };

  const fetchDefaultGifs = async () => {
    const response = await fetch(
      `https://tenor.googleapis.com/v2/search?q=trending&key=${API_KEY_TENOR}&limit=52`,
    );
    const data = await response.json();
    setGifs(data.results || []);
  };

  // const fetchIcons = async (query: string) => {
  //   const options = {
  //     method: 'GET',
  //     headers: {
  //       accept: 'application/json',
  //       Authorization: `Bearer ${API_KEY_ICONFINDER}`,
  //     },
  //   };

  //   try {
  //     const response = await fetch(
  //       `https://api.iconfinder.com/v4/icons/search?query=${query}&count=10`,
  //       options,
  //     );
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     console.log('icons', data);
  //     setIcons(data.icons || []);
  //   } catch (error) {
  //     console.error('Failed to fetch icons:', error);
  //   }
  // };

  const fetchLocalImages = () => {
    const images = [
      '/image/arrow.png',
      '/image/arrow1.png',
      '/image/arrow2.png',
      '/image/arrow3.png',
      '/image/arrow4.png',
      '/image/arrow5.png',
      '/image/attention.png',
      '/image/book.png',
      '/image/bravo.png',
      '/image/bronzeMedal.png',
      '/image/checkmarks.png',
      '/image/congrats.png',
      '/image/error.png',
      '/image/Examen.png',
      '/image/goldMedale.png',
      '/image/hourglass.png',
      '/image/important.png',
      '/image/neutral.png',
      '/image/openBook.png',
      '/image/QR.png',
      '/image/question-answer.png',
      '/image/Question.png',
      '/image/restart.png',
      '/image/sad.png',
      '/image/silverMedale.png',
      '/image/smile.png',
    ];
    setLocalImages(images);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchGifs(value);
    fetchIcons(value);
  };

  const activityId = useStore((state) => state.activitySlice.currActitityId);

  const handleImageClick = (image: any) => {
    const isGif = image.media_formats && image.media_formats.gif;
    const file = isGif ? image.media_formats.gif.url : image;
    onImageClick({
      activityId,
      type: 'ASticker',
      content: { file },
      meta: {},
      cfg: {
        width: 200,
        height: 156,
        position: [0, 0, 0],
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
      },
    });
    onClose();
  };

  return (
    <Modal
      title={t('common.choose-media')}
      visible={visible}
      onCancel={onClose}
      footer={null}
      style={{
        maxHeight: '60vh',
      }}>
      <Tabs defaultActiveKey='1'>
        {' '}
        <TabPane
          tab={t('common.local-images')}
          key='1'>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              marginTop: '10px',
              maxHeight: '60vh',
              overflowY: 'auto',
            }}>
            {localImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Image ${index}`}
                style={{
                  width: '100px',
                  height: '100px',
                  margin: '5px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onClick={() => handleImageClick(image)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLImageElement).style.transform =
                    'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLImageElement).style.transform =
                    'scale(1)';
                }}
              />
            ))}
          </div>
        </TabPane>
        <TabPane
          tab={t('common.gif')}
          key='2'>
          <Input
            placeholder={t('common.search-gif') as string}
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              marginTop: '10px',
              maxHeight: '56vh',
              overflowY: 'auto',
            }}>
            {gifs && gifs.length > 0 ? (
              gifs.map((gif) => (
                <img
                  key={gif.id}
                  src={gif.media_formats.gif.url}
                  alt={gif.title}
                  style={{
                    width: '100px',
                    height: '100px',
                    margin: '5px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleImageClick(gif)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLImageElement).style.transform =
                      'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLImageElement).style.transform =
                      'scale(1)';
                  }}
                />
              ))
            ) : (
              <p>{t('common.no-results')}</p>
            )}
          </div>
        </TabPane>
        {/* <TabPane
          tab='Icône'
          key='3'>
          <Input
            placeholder={t('common.search-icon') as string}
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
            {icons.map((icon) => (
              <img
                key={icon.id}
                src={icon.url}
                alt={icon.title}
                style={{
                  width: '100px',
                  height: '100px',
                  margin: '5px',
                  cursor: 'pointer',
                }}
                onClick={() => handleImageClick(icon)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLImageElement).style.transform =
                    'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLImageElement).style.transform =
                    'scale(1)';
                }}
              />
            ))}
          </div>
        </TabPane> */}
      </Tabs>
    </Modal>
  );
};

export default MediaModal;
