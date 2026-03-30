require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

const connectDB = require('./config/db');
const initSocket = require('./sockets/socket');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const requirementRoutes = require('./routes/requirements');
const traceabilityRoutes = require('./routes/traceability');
const testCaseRoutes = require('./routes/testcases');
const kpiRoutes = require('./routes/kpi');

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

// Connect DB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' }));
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts' }));

// Attach socket.io to requests
app.use((req, res, next) => { req.io = io; next(); });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/traceability', traceabilityRoutes);
app.use('/api/testcases', testCaseRoutes);
app.use('/api/kpi', kpiRoutes);

// Reports routes
app.get('/api/reports/srs', require('./middleware/auth').protect, require('./controllers/kpiController').getReportSRS);
app.get('/api/reports/traceability', require('./middleware/auth').protect, require('./controllers/kpiController').getReportTraceability);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`));

module.exports = { app, io };
