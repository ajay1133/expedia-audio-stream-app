import * as uuid from 'uuid';
import config from '../config/index.js';
import axios from 'axios';
// Function to be triggered on socket connection when established 
export const onSocketConnection = (s3, socket) => {
  console.info(new Date(), 'New WebSocket connection');
  // Handle end of audio recording
  socket.on('stop-recording', async (audioData) => {
    console.info(new Date(), 'Recording stopped, audioData received = ', audioData);
    if (!audioData) {
       throw new Error('Invalid or empty audioData');
    }
    // Create a temp access presigned URL for uploading to S3
    const params = {
      Bucket: config.AWS.S3_AUDIO_BUCKET,
      Key: `${uuid.v4()}.mp3`,
      Expires: 60 * 5, // The presigned URL will be valid for 5 minutes
    };
    try {
      const putPresignedUrl = s3.getSignedUrl('putObject', params);
      // Upload the audio file to S3 using the presigned URL
      await uploadToS3(putPresignedUrl, audioData);
      console.info(new Date(), 'Saved audio file successfully = ', params.Key);
    } catch (error) {
      console.error('Error during audio upload process:', error);
      socket.emit('upload-error', { message: 'Error during upload' });
    }
  });
  // Handle connection close
  socket.on('disconnect', () => {
    console.log('WebSocket connection closed');
  });
};
// Function to upload audio data to S3 using the presigned URL
export const uploadToS3 = async (presignedUrl, audioData) => {
    return new Promise(async (resolve, reject) => {
      try {
          const res = await axios.put(presignedUrl, { data: audioData }, {
            headers: {
              'Content-Type': 'audio/wav', // Ensure the content type is set as audio/wav
            },
          });
          if (!res) {
              throw new Error('Invalid response on uploading file to s3 = ', res);
          }
          console.info(new Date(), 'Audio file uploaded successfully');
          resolve();
      } catch (e) {
          console.error('Error uploading file to s3 = ', e);
          reject(e);
      }
    });
  };
