import express from 'express';
import cors from 'cors';
import http from 'http';
import * as socketIo from 'socket.io';
import aws from 'aws-sdk';
import routes from './routes/index.js';
import * as socketUtils from './utils/socket.js';
import config from './config/index.js';

const app = express();
// Enable CORS for specific origin (React app)
app.use(cors({ origin: config.CLIENT_BASE_URL, methods: ['GET', 'POST'] }));
// Create http web socket server
const server = http.createServer(app);
const io = new socketIo.Server(server, {
    cors: {
      origin: config.CLIENT_BASE_URL,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true
    }
});
// Initialize AWS SDK
aws.config.update({ 
    accessKeyId: config.AWS.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    region: config.AWS.AWS_REGION,
    signatureVersion: 'v4'
});
const s3 = new aws.S3();
// WebSocket connection for audio streaming
io.on('connection', (socket) => socketUtils.onSocketConnection(s3, socket));
// Middleware to serve static files (if needed for a web frontend)
app.use(express.static('public'));
app.use('/api/v1/', routes);
server.listen(config.APP_PORT, () => {
    console.info('Server is listening on port = ', config.APP_PORT);
});
// Export the default app
export default app;
