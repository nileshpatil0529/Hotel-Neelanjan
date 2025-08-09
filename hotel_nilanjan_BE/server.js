const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models');
const path = require('path');
const { initWebSocket } = require('./services/websocketService');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderHistoryRoutes = require('./routes/orderHistoryRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const PORT = process.env.PORT || 5000;
const SERVER = process.env.SERVER;
const ANGULAR_APP_PATH = process.env.ANGULAR_APP_PATH;

// Serve static files from the Angular dist folder
const angularDistPath = path.join(__dirname, ANGULAR_APP_PATH);
app.use(express.static(angularDistPath));

// Middleware
app.use(cors({
    origin: '*', // Allow all origins (change this for security in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

// Alternatively, configure specific origins and options
app.use(cors({
    origin: '*', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders-history', orderHistoryRoutes);

app.get('*', (req, res) => {
    if (!req.originalUrl.startsWith('/api')) {
        res.sendFile(path.join(angularDistPath, 'index.html'));
    }
});
// Initialize WebSocket
initWebSocket(server);

// Sync database and start server
db.sequelize.sync({ force: false })
    .then(() => {
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => console.log('Database connection failed:', err));
