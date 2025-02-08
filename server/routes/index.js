import express from 'express';
const routes = express.Router();
// Ping route
routes.get('/ping', (req, res) => { 
    console.info('OK');
    res.status(200).json({ message: 'OK' });
});
// Error middleware
routes.use((req, res) => {
    const error = new Error('Not found');
    console.error(error);
    return res.status(404).json({ message: error.message });
});
// Export routes
export default routes;
