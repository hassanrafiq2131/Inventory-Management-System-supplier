import fetch from 'node-fetch';

const IMGUR_CLIENT_ID = '77caa74f90e91e2'; 

export const uploadToImgur = async (fileBuffer) => {
  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: new URLSearchParams({
        image: fileBuffer.toString('base64'),
        type: 'base64',
      }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data.link; // Return the Imgur image URL
    } else {
      throw new Error(result.data.error || 'Failed to upload to Imgur');
    }
  } catch (error) {
    console.error('Error uploading to Imgur:', error.message);
    throw error;
  }
};
