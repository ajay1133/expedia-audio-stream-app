import dotenv from 'dotenv';
// Init dotenv
dotenv.config();
// Deconstruct process.env
const { 
    APP_NAME, PORT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, CLIENT_BASE_URL, 
    S3_AUDIO_BUCKET, DYNAMODB_AUDIO_METADATA_TABLE 
} = process ? process.env : {};
const config = {
    APP_NAME: APP_NAME || 'expedia-audio-stream-server',
    APP_PORT: PORT || 4000,
    CLIENT_BASE_URL,
    AWS: {
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
        AWS_REGION,
        S3_AUDIO_BUCKET,
        DYNAMODB_AUDIO_METADATA_TABLE
    }
};
// Export config
export default config;
