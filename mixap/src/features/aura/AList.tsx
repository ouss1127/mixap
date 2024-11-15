// import React, { useCallback, useState, useEffect, useRef } from 'react';
// import { useThree } from '@react-three/fiber';
// import { Html } from '@react-three/drei';
// import { useSpring, a as a3f } from '@react-spring/three';
// import { animated, useSpring as useSpringWeb } from '@react-spring/web';
// import { useGesture } from '@use-gesture/react';
// import { Resizable } from 're-resizable';
// import { debounce } from 'lodash';

// import { Typography, Popover, Button, Radio, Checkbox } from 'antd';
// import { Modal, Input } from 'antd';

// import SwipeIcon from '@mui/icons-material/Swipe';
// import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
// import  Draggable  from 'react-draggable';

// import {
//     DeleteOutlined,
//     BulbOutlined,
// } from '@ant-design/icons';

// import OpenAI from 'openai';
// const openai = new OpenAI({
//     apiKey: 'sk-proj-yESQDypXwephO39cjnqlT3BlbkFJUUJMBHHNkoPW2N90wbQ5',
//     dangerouslyAllowBrowser: true,
// });

// /** @jsxImportSource @emotion/react */
// // import { css } from '@emotion/react';

// import useStore from '../../hooks/useStore';
// import useControls from '../../hooks/useControls';
// import fonts from '../../fonts/fonts';
// import { Text3f } from '../../components/Text3f';
// import { mxPopbar, mxResizable } from '../../utils/styles';
// import { AuraMode } from '../editor/Board';
// import { useTrace } from '../../hooks/useTrace';
// import { TRACES } from '../../db/traces';

// import { useTranslation } from 'react-i18next';
// import { data } from '@tensorflow/tfjs';

// export function AList({ canvasRef, id, mode, onChange, onDelete }: any) {

//     const { content, cfg, activityId, type } = useStore((store) =>
//         store.auraSlice.find(id),
//     ) as any;

//     const markerImages = [];
//     console.log(markerImages)

//     const textRef = useRef<any>();
//     const { viewport, size } = useThree();
//     const widthFactor = size.width / viewport.width;
//     const heightFactor = size.height / viewport.height;

//     const [switchGuesture, setSwitchGesture] = useState<string>('drag');
//     const [dragging, setDragging] = useState<boolean>(false);
//     const [visibleControls, setVisibleControls] = useState<boolean>(true);
//     const [editing, setEditing] = useState<boolean>(false);
//     const [resizing, setResizing] = useState<boolean>(false);

//     const { trace } = useTrace({});

//     const handleControlsVisibility = (visible) => {
//         setVisibleControls(visible);
//     };

//     //  ////////////////////////////////////////
// // Add this state variable at the top of your component
// const [textAreas, setTextAreas] = useState<string[]>([]);

// // This function will be called when the "Generate Text Area" button is clicked
// const generateATexts = async () => {
//     const completion = await openai.chat.completions.create({
//         model: 'gpt-4-turbo',
//         messages: [
//             {
//                 role: 'system',
//                 content: 'You are a helpful assistant.',
//             },
//             {
//                 role: 'user',
//                 content: `generate a list of 3 words directly without start with any sentese`,
//             },
//         ],
//     });

//     const words = (completion.choices[0].message.content as string).trim().split(' ');

//     setTextAreas(words);
// };

//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [newText, setNewText] = useState('');
//     const [genText, setGenText] = useState('');
//     const [genImage, setGenImage] = useState('');
//     const [genAudio, setGenAudio] = useState('');
//     const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([]);

//     const showModal = () => {
//         setIsModalVisible(true);
//     };

//     const handleReplaceText = () => {
//         showModal();
//     };

//     const handleOk = () => {
//         handleChange({ content: { value: genText } });
//         setIsModalVisible(false);
//     };

//     type ContentType = 'Text' | 'Image' | 'Audio';

//     const handleCheckboxChange = (checkedValues: ContentType[]) => {
//         setSelectedContentTypes(checkedValues);
//     };

//     const handleGenerate = async () => {
//         try {
//             if ((selectedContentTypes as string[]).includes('Text')) {
//                 const completion = await openai.chat.completions.create({
//                     model: 'gpt-4-turbo',
//                     messages: [
//                         {
//                             role: 'system',
//                             content: 'You are a helpful assistant, you can generate text, image, and audio.',
//                         },
//                         {
//                             role: 'user',
//                             content: `'${newText}'`,
//                         },
//                     ],
//                 });
//                 setGenText(completion.choices[0].message.content || '');
//             }
//             if ((selectedContentTypes as string[]).includes('Image')) {
//                 const imageResponse = await fetch(
//                     'https://api.openai.com/v1/images/generations',
//                     {
//                         method: 'POST',
//                         headers: {
//                             Authorization: `Bearer sk-proj-yESQDypXwephO39cjnqlT3BlbkFJUUJMBHHNkoPW2N90wbQ5`,
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify({
//                             model: 'dall-e-2',
//                             prompt: newText,
//                             n: 1,
//                             size: '256x256',
//                         }),
//                     },
//                 );

//                 const imageData = await imageResponse.json();
//                 setGenImage(imageData.data[0].url);
//             }
//             if ((selectedContentTypes as string[]).includes('Audio')) {
//                 const response = await fetch('https://api.openai.com/v1/audio/speech', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer sk-proj-yESQDypXwephO39cjnqlT3BlbkFJUUJMBHHNkoPW2N90wbQ5`
//                     },
//                     body: JSON.stringify({
//                         model: 'tts-1',
//                         voice: 'alloy',
//                         input: newText,
//                     })
//                 });

//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }

//                 const blob = await response.blob();

//                 // Revoke the old blob URL
//                 if (genAudio) {
//                     URL.revokeObjectURL(genAudio);
//                 }

//                 const url = URL.createObjectURL(blob);
//                 setGenAudio(url);
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     };
//     //////////////////////////////////////////

//     const options = [
//         {
//             component: 'Select',
//             icon: <TitleOutlinedIcon />,
//             label: 'fontFamily',
//             key: 'fontFamily',
//             defaultValue: 'Roboto',
//             width: 100,
//             size: 'large',
//             options: Object.keys(fonts).map((label) => ({
//                 key: label,
//                 label: (
//                     <Typography.Text css={{ fontSize: '0.6rem', fontFamily: label }}>
//                         {label}
//                     </Typography.Text>
//                 ),
//                 value: label,
//             })),
//             description: '',
//         },

//         // 
//         {
//             component: 'Button',
//             icon: <BulbOutlined />,
//             label: 'replaceText',
//             key: 'replaceText',
//             size: 'large',
//             onClick: handleReplaceText,
//             description: '',
//         },

//         {
//             component: 'Button',
//             icon: <DeleteOutlined />,
//             label: 'delete',
//             key: 'delete',
//             size: 'large',
//             onClick: onDelete,
//             description: '',
//         },
//     ];

//     const initialValues = useCallback(() => {
//         const values = {};
//         options?.forEach((item) => {
//             values[item.key] = item.defaultValue;
//         });
//         return values;
//     }, [options]);

//     const { controlsForm } = useControls({
//         options,
//         fieldsValue: cfg?.style || {},
//         initialValues: Object.assign(initialValues(), cfg?.style || []),
//         onChange: ({ allFields }) => {
//             handleChange({
//                 cfg: {
//                     style: allFields,
//                 },
//             });
//         },
//     });

//     const [spring, api] = useSpring<any>(() => ({
//         rotation: cfg?.rotation,
//         position: cfg?.position,
//     }));

//     const handleChange = useCallback((payload) => {
//         onChange &&
//             onChange({
//                 id,
//                 activityId,
//                 type,
//                 ...payload,
//             });
//     }, []);

//     const debounceChange = useCallback(
//         debounce((payload) => handleChange(payload), 500),
//         [],
//     );

//     useEffect(() => {
//         textRef?.current?.addEventListener('click', () => {
//             setEditing(false);
//         });

//         return () => {
//             textRef?.current?.removeEventListener('click', () => {
//                 setEditing(false);
//             });
//         };
//     }, [textRef?.current]);

//     const styles = useSpringWeb({
//         opacity: editing ? 1 : content.value ? 0 : 1,
//     });

//     const gesture = useGesture(
//         {
//             onDragEnd: ({ offset: [x, y] }) => {
//                 setEditing(false);
//                 setDragging(false);
//                 setVisibleControls(true);

//                 if (switchGuesture === 'drag') {
//                     handleChange({
//                         cfg: {
//                             position: [x / widthFactor, -y / heightFactor, 0],
//                         },
//                     });
//                 } else if (switchGuesture === 'rotate2D') {
//                     handleChange({
//                         cfg: {
//                             rotation: [
//                                 cfg.rotation[0],
//                                 cfg.rotation[1],
//                                 (360 * x) / cfg.factor / 100,
//                             ],
//                         },
//                     });
//                 } else if (switchGuesture === 'rotate3D') {
//                     handleChange({
//                         cfg: {
//                             rotation: [y / 50, x / 50, cfg.rotation[2]],
//                         },
//                     });
//                 }
//             },
//             onDragStart: () => {
//                 setEditing(false);
//                 setDragging(true);
//                 setVisibleControls(false);
//             },
//             onDrag: ({ pinching, cancel, offset: [x, y] }) => {
//                 if (pinching || resizing) {
//                     return cancel();
//                 }
//                 if (switchGuesture === 'drag') {
//                     api.start({
//                         position: [x / widthFactor, -y / heightFactor, 0],
//                     });
//                 } else if (switchGuesture === 'rotate2D') {
//                     api.start({
//                         rotation: [
//                             cfg.rotation[0],
//                             cfg.rotation[1],
//                             (360 * x) / cfg.factor / 100,
//                         ],
//                     });
//                 } else if (switchGuesture === 'rotate3D') {
//                     api.start({
//                         rotation: [y / 50, x / 50, cfg.rotation[2]],
//                     });
//                 }
//             },
//         },
//         {
//             drag: {
//                 bounds: canvasRef,
//                 rubberband: true,
//                 pointer: { touch: true },
//             },
//         },
//     );

//     return (
//         <>
//             {mode === AuraMode.ARVIEW && (
//                 <group
//                     position={[
//                         (cfg.position[0] * cfg.factor + cfg.marker.width / 2) *
//                         cfg.marker.widthRatio,
//                         (cfg.position[1] * cfg.factor + cfg.marker.height / 2) *
//                         cfg.marker.heightRatio,
//                         0,
//                     ]}
//                     rotation={cfg.rotation}>
//                     <Text3f
//                         {...cfg.style}
//                         text={content.value}
//                         visible={true}
//                         maxWidth={cfg.width / cfg.style.fontSize}
//                         width={cfg.width * cfg.marker.widthRatio}
//                         height={cfg.height * cfg.marker.heightRatio}
//                         factor={1}
//                         fontSize={1}
//                         position={[
//                             (-cfg.width * cfg.marker.widthRatio) / 2,
//                             (cfg.height * cfg.marker.heightRatio) / 2,
//                             1,
//                         ]}
//                         scale={[
//                             cfg.style.fontSize * cfg.marker.widthRatio,
//                             cfg.style.fontSize * cfg.marker.heightRatio,
//                             0,
//                         ]}
//                     />
//                 </group>
//             )}

//             {mode === AuraMode.ARCANVAS && (
//                 <group
//                     position={cfg.position}
//                     rotation={cfg.rotation}>
//                     <Text3f
//                         {...cfg.style}
//                         visible={true}
//                         text={content.value}
//                         maxWidth={cfg.width / cfg.style.fontSize}
//                         width={cfg.width}
//                         height={cfg.height}
//                         factor={cfg.factor}
//                         fontSize={1}
//                         position={[
//                             -cfg.width / cfg.factor / 2,
//                             cfg.height / cfg.factor / 2,
//                             0,
//                         ]}
//                         scale={[
//                             cfg.style.fontSize / cfg.factor,
//                             cfg.style.fontSize / cfg.factor,
//                             0,
//                         ]}
//                     />
//                 </group>
//             )}

//             {mode === AuraMode.CANVAS && (
//                 <a3f.group
//                     {...spring}
//                     scale={[1, 1, 1]}>
//                     <Text3f
//                         {...cfg.style}
//                         visible={!editing}
//                         text={content.value}
//                         maxWidth={cfg.width / cfg.style.fontSize}
//                         width={cfg.width}
//                         height={cfg.height}
//                         factor={cfg.factor}
//                         fontSize={1}
//                         position={[
//                             -cfg.width / cfg.factor / 2,
//                             cfg.height / cfg.factor / 2,
//                             0,
//                         ]}
//                         scale={[
//                             cfg.style.fontSize / cfg.factor,
//                             cfg.style.fontSize / cfg.factor,
//                             0,
//                         ]}
//                     />
//                     <Html
//                         zIndexRange={[100, 100]}
//                         css={{
//                             left: -cfg.width / 2,
//                             top: -cfg.height / 2,
//                         }}>

//                         <Resizable
//                             css={{
//                                 ...mxResizable,
//                                 transform: `rotateZ(${-cfg.rotation[2]}rad)`,
//                             }}
//                             size={{
//                                 width: cfg.width,
//                                 height: cfg.height,
//                             }}
//                             onResizeStop={(e, direction, ref, d) => {
//                                 setResizing(false);
//                                 setEditing(false);
//                                 handleChange({
//                                     cfg: {
//                                         width: cfg.width + d.width,
//                                         height: cfg.height + d.height,
//                                     },
//                                 });
//                                 trace(TRACES.RESIZE_AURA);
//                             }}
//                             onResizeStart={() => {
//                                 setResizing(true);
//                             }}>
//                             <Popover
//                                 color='var(--active-color)'
//                                 content={controlsForm}
//                                 visible={visibleControls}
//                                 onVisibleChange={handleControlsVisibility}>
//                                 <div
//                                     css={mxPopbar}
//                                     ref={textRef}>
//                                     <animated.div
//                                         style={styles}
//                                         className={visibleControls ? 'active-aura' : ''}
//                                         {...gesture()}
//                                         css={{
//                                             width: '100%',
//                                             height: '100%',
//                                             // transform: `rotateZ(${-cfg.rotation[2]}rad)`,
//                                             touchAction: 'none',
//                                         }}
//                                         onPointerLeave={() => {
//                                             setEditing(false);
//                                         }}
//                                         onClick={() => {
//                                             setEditing(true);
//                                             setResizing(false);
//                                         }}>
//                                         <TextArea
//                                             style={{
//                                                 ...cfg.style,
//                                                 width: '100%',
//                                                 height: '100%',
//                                                 margin: '0 !important',
//                                                 overflow: 'hidden',
//                                                 lineHeight: 1.15,
//                                                 resize: 'none',
//                                                 outline: 'none',
//                                                 border: 'none',
//                                                 cursor: editing
//                                                     ? 'cursor'
//                                                     : switchGuesture === 'drag'
//                                                         ? 'move'
//                                                         : 'grab',
//                                             }}
//                                             value={content.value}
//                                             onChange={(value) => {
//                                                 debounceChange({
//                                                     content: { value: value },
//                                                 });
//                                             }}
//                                             />
//                                     </animated.div>
//                                 </div>
//                             </Popover>
//                         </Resizable>

//                         {textAreas.map((text, index) => (
//                         <Draggable>
//                         <Resizable
//                             css={{
//                                 ...mxResizable,
//                                 transform: `rotateZ(${-cfg.rotation[2]}rad)`,
//                             }}
//                             size={{
//                                 width: cfg.width,
//                                 height: cfg.height,
//                             }}
//                             onResizeStop={(e, direction, ref, d) => {
//                                 setResizing(false);
//                                 setEditing(false);
//                                 handleChange({
//                                     cfg: {
//                                         width: cfg.width + d.width,
//                                         height: cfg.height + d.height,
//                                     },
//                                 });
//                                 trace(TRACES.RESIZE_AURA);
//                             }}
//                             onResizeStart={() => {
//                                 setResizing(true);
//                             }}>
//                             <Popover
//                                 color='var(--active-color)'
//                                 content={controlsForm}
//                                 visible={visibleControls}
//                                 onVisibleChange={handleControlsVisibility}>
//                                 <div
//                                     css={mxPopbar}
//                                     ref={textRef}>
//                                         <animated.div key={index}>
//                                             <TextArea
//                                                 style={{
//                                                     ...cfg.style,
//                                                     width: '100%',
//                                                     height: '100%',
//                                                     margin: '0 !important',
//                                                     overflow: 'hidden',
//                                                     lineHeight: 1.15,
//                                                     resize: 'none',
//                                                     outline: 'none',
//                                                     border: 'none',
//                                                     cursor: editing
//                                                         ? 'cursor'
//                                                         : switchGuesture === 'drag'
//                                                             ? 'move'
//                                                             : 'grab',
//                                                 }}
//                                                 value={text}
//                                                 onChange={(value) => {
//                                                     // Update the value of the text area in the textAreas array
//                                                     setTextAreas(prevTextAreas => prevTextAreas.map((text, i) => i === index ? value : text));
//                                                 }}
//                                             />
//                                         </animated.div>
//                                 </div>
//                             </Popover>
//                         </Resizable>
//                         </Draggable>))}

//                         <Modal
//                             title="Enter a description about what you want to generate"
//                             visible={isModalVisible}
//                             onOk={handleOk}
//                             onCancel={() => setIsModalVisible(false)}
//                             bodyStyle={{ padding: '20px' }}
//                             style={{ top: '150px' }}
//                             footer={
//                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                                     <Button
//                                         onClick={() => setIsModalVisible(false)}
//                                         style={{ borderColor: '#f44336', color: '#f44336', borderRadius: '50px' }}>
//                                         Cancel
//                                     </Button>
//                                     <div>
//                                         <Button
//                                             onClick={handleOk}
//                                             style={{ backgroundColor: '#4CAF50', borderColor: '#4CAF50', color: '#ffffff', marginLeft: '10px', borderRadius: '50px' }}>
//                                             OK
//                                         </Button>
//                                     </div>
//                                 </div>
//                             }>
//                             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//                                 <Input
//                                     placeholder="Enter text..."
//                                     value={newText}
//                                     onChange={(e) => setNewText(e.target.value)}
//                                     style={{ borderRadius: '5px' }}
//                                 />
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
//                                     <Button onClick={generateATexts} style={{ borderRadius: '20px' }}>
//                                         Generate
//                                     </Button>
//                                 </div>
//                             </div>
//                         </Modal>
//                     </Html>
//                 </a3f.group>
//             )}
//         </>
//     );
// }

// export const TextArea = ({
//     value,
//     onChange,
//     onClick,
//     style,
//     visibleControls,
// }: any) => {
//     const [val, setVal] = useState(value);

//     // Update local state when prop `value` changes /// 
//     useEffect(() => {
//         setVal(value);
//     }, [value]);

//     const { t } = useTranslation();

//     const handleChange = useCallback((value) => {
//         setVal(value);
//         onChange(value);
//     }, []);

//     return (
//         <textarea
//             onClick={onClick}
//             placeholder={t('common.edit-generator') as string}
//             css={style}
//             value={val}
//             onChange={(e) => handleChange(e.target.value)}></textarea>
//     );
// };
export {};
