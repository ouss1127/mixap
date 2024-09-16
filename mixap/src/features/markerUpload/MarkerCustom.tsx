import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useSpring, a as a3f } from '@react-spring/three';
import { animated, useSpring as useSpringWeb } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { Resizable } from 're-resizable';
import { debounce } from 'lodash';
import useSound from 'use-sound';
import { Button, Drawer, FloatButton, Input, Typography } from 'antd';
import { Html } from '@react-three/drei';
import {
  AudioOutlined,
  BulbOutlined,
  CopyOutlined,
  EditOutlined,
  HistoryOutlined,
  MessageOutlined,
  OpenAIOutlined,
  ReloadOutlined,
  RobotOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { describeImage, generateAudioSpeech } from '@/AIServer/Api';
import useStore from '../../hooks/useStore';
import useControls from '../../hooks/useControls';
import fonts from '../../fonts/fonts';
import { Text3f } from '../../components/Text3f';
import { mxPopbar, mxResizable } from '../../utils/styles';
import { AuraMode } from '../editor/Board';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';
import { useAura } from '@/hooks';
import { getID } from '@/utils/uniqueId';
import { trace } from 'loglevel';
import { RxColOp } from '@/db/types';
import { Spinner } from '../../components/Spinner'; // Import the Spinner component

// MarkerCustom component definition
export function MarkerCustom({
  markerImages,
  setSavedMessage,
  activity,
  activityId,
  meta,
  id,
  mode,
  onChange,
  onDelete,
  onMessage,
}: any) {
  // useRef hook to reference the end of the messages
  const messageEnd = useRef<HTMLDivElement>(null);
  const markerCfg = useStore((state) => state.mkUploadSlice.markerCfg);
  //const activityId = useStore((state) => state.activitySlice.currActitityId);
  const { onRxColAura } = useAura();
  // useState hooks for managing component state
  const [newText, setNewText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [genText, setGenText] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', isBot: true },
  ]);
  const [loading, setLoading] = useState(false); // Add loading state
  const isAI = useStore((state) => state.playerSlice.isAI);

  // Function to handle text replacement
  const handleReplaceText = () => {
    setIsModalVisible(true);
  };

  // Function to handle messages
  const handleMessage = async (predefinedMessage: string) => {
    const prompt = predefinedMessage || newText;
    setNewText('');
    setLoading(true); // Set loading to true when starting the request
    // Add user's message to the messages state
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: prompt, isBot: false },
    ]);
    // Call to describeImage API
    const res = await describeImage(prompt, markerImages);
    setLoading(false); // Set loading to false after the response is received
    if (typeof res.choices[0]?.message?.content === 'string') {
      const botResponse = res.choices[0].message.content;
      setGenText(botResponse);
      // Add bot's response to the messages state
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botResponse, isBot: true },
      ]);
    }
  };

  // Define your pre-defined messages
  const predefinedMessages = [
    { text: "5 faits extraordinaire sur l'image", icon: <BulbOutlined /> },
    {
      text: "Un fait historique sur l'image",
      icon: <HistoryOutlined />,
    },
    { text: "Décris l'image du marqueur", icon: <EditOutlined /> },
  ];

  // Create a new function to handle predefined messages
  const handlePredefinedMessage = async (message: string) => {
    setNewText(message);
    await handleMessage(message);
  };

  // Function to regenerate bot message
  const handleRegenerateMessage = async (prompt: string) => {
    // Find the last user message in the messages state
    const lastUserMessage = messages.find((message) => !message.isBot);
    if (lastUserMessage) {
      setLoading(true); // Set loading to true when starting the request
      // Call to describeImage API
      const res = await describeImage(lastUserMessage.text, markerImages);
      setLoading(false); // Set loading to false after the response is received
      if (typeof res.choices[0]?.message?.content === 'string') {
        const botResponse = res.choices[0].message.content;
        setGenText(botResponse);
        // Replace the last bot's response in the messages state
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastBotMessageIndex = newMessages.findIndex(
            (message) => message.isBot,
          );
          newMessages[newMessages.length - 1 - lastBotMessageIndex] = {
            text: botResponse,
            isBot: true,
          };
          return newMessages;
        });
      }
    }
  };

  const handleAddAText = ({ activityId, value }) => {
    onRxColAura(
      RxColOp.Add,
      {
        id: getID(),
        activityId,
        type: 'AText',
        content: { value },
        meta,
        cfg: {
          style: {
            fontFamily: 'Roboto',
            fontSize: 24,
            color: '#000',
            background: 'transparent',
            textAlign: 'left',
            fontVariant: 'normal',
            fontStyle: 'normal',
            fontWeight: 'normal',
          },
          width: 200,
          height: 150,
          position: [0, 0, 0],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
          ...markerCfg,
        },
      },
      [],
    );

    trace(TRACES.ADD_AURA);

    //playPop();
  };

  // useEffect hook to scroll to the end of messages when messages state changes
  useEffect(() => {
    if (messageEnd.current) {
      messageEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Html>
      {isAI && (
        <FloatButton
          // type='primary'
          css={{
            position: 'absolute',
            right: '-47vw',
            top: '13vw',
            fontSize: '32px',
            '& .ant-float-btn-body': {
              background: '#984ea3 !important',
            },
          }}
          onClick={handleReplaceText}
          icon={<RobotOutlined />}
        />
      )}
      <Drawer
        title='Chat with your Marker!'
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        width='35%'
        bodyStyle={{ padding: '20px' }}
        footer={
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between', // Ensure buttons are spaced out evenly
                marginBottom: '10px', // Space below buttons
                flexWrap: 'wrap', // Wrap buttons if they don't fit in one line
              }}>
              {predefinedMessages.map((message, index) => (
                <Button
                  key={index}
                  onClick={() => handlePredefinedMessage(message.text)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px', // Rounded corners
                    padding: '10px', // Padding inside buttons
                    border: '1px solid black',
                    backgroundColor: '#f0f0f0', // Background color
                    color: 'black',
                    textAlign: 'left',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transitionDuration: '0.4s',
                    cursor: 'pointer',
                    flex: '1 1 30%', // Ensure buttons have the same width and wrap if necessary
                    maxWidth: '30%', // Limit maximum width to ensure consistency
                    minHeight: '70px', // Set a minimum height for the buttons
                    boxSizing: 'border-box',
                    whiteSpace: 'normal', // Allow text to wrap
                    lineHeight: '1.5', // Set line height for better text spacing
                  }}>
                  {message.icon}
                  <span style={{ marginLeft: '5px' }}>{message.text}</span>
                </Button>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                style={{
                  height: '40px',
                  width: '100%',
                  borderRadius: '5px',
                  padding: '10px',
                  border: '1px solid grey',
                }}
              />
              <Button
                onClick={() => handleMessage(newText)}
                style={{
                  marginBottom: '20px',
                  borderRadius: '50px',
                  padding: '10px 30px',
                }}
                icon={<SendOutlined />}
              />
            </div>
          </>
        }>
        {loading && <Spinner />} {/* Show Spinner when loading */}
        {generatedAudio && (
          <audio
            controls
            key={generatedAudio}>
            <source
              src={generatedAudio}
              type='audio/mpeg'
            />
          </audio>
        )}
        {messages.map((message, index) => (
          <Typography.Paragraph>
            <pre
              key={index}
              {...(message.isBot
                ? {
                    style: {
                      borderLeft: '5px solid #0084ff',
                      margin: '0 40px 20px 0',
                      padding: '10px',
                      backgroundColor: '#eceff1',
                      borderRadius: '20px',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                      textAlign: 'left',
                    },
                  }
                : {
                    style: {
                      margin: '0 0 20px 40px',
                      color: '#f0f0f0',
                      fontSize: '14px',
                      borderRadius: '20px',
                      padding: '10px',
                      backgroundColor: '#0084ff',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                      textAlign: 'left',
                    },
                  })}>
              {message.text}
              {message.isBot && index === messages.length - 1 && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}>
                    <Button
                      onClick={() => handleRegenerateMessage(newText)}
                      style={{
                        marginLeft: '10px',
                        padding: '0px 5px',
                        fontSize: '10px',
                      }}
                      icon={<ReloadOutlined />}
                    />
                    <Button
                      onClick={() => {
                        handleAddAText({
                          activityId,
                          value: message.text,
                        });
                      }}
                      style={{
                        marginLeft: '10px',
                        padding: '0px 5px',
                        fontSize: '10px',
                      }}
                      icon={<CopyOutlined />}
                    />
                  </div>
                </>
              )}
            </pre>
          </Typography.Paragraph>
        ))}
        <div ref={messageEnd} />
      </Drawer>
    </Html>
  );
}
