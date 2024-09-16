import OpenAI from 'openai';

const openai = new OpenAI({
  //add API key here
  apiKey: 'sk-xxxxxx',
  dangerouslyAllowBrowser: true,
});

export const describeImage = async (prompt, images) => {
  console.log('GPT: start', prompt, images);

  const imgInputs = images?.map((img) => {
    return {
      type: 'image_url',
      image_url: {
        url: img,
      },
    };
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      {
        role: 'user',
        content: [{ type: 'text', text: `${prompt}` }, ...imgInputs],
      },
    ],
  });
  console.log('GPT: finish', images);
  return response;
};

export const generateAudioSpeech = async (genText) => {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openai.apiKey}`,
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: 'alloy',
      input: genText,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const blob = await response.blob();

  const url = URL.createObjectURL(blob);
  return { url, blob };
};

export const generateText = async (newText) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-05-13',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: `'${newText}'`,
        },
      ],
    });
    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error:', error);
    return '';
  }
};

export const generateImage = async (newText) => {
  try {
    console.log('start generateImage', newText);
    const imageResponse = await fetch(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-2',
          prompt: newText,
          response_format: 'b64_json',
          n: 1,
          size: '256x256',
        }),
      },
    );

    const imageData = await imageResponse.json();
    let imageB64 = imageData?.data[0]?.b64_json;
    imageB64 = 'data:image/jpeg;base64,' + imageB64;

    console.log('imageData', imageB64);
    const blob = await (await fetch(imageB64)).blob();
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    console.log('finish generateImage', file);
    return { imageB64, file };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};
