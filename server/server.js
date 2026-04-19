require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const { seedDatabase } = require('./scripts/seed');

const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const statsRoutes = require('./routes/statsRoutes');
const studentRoutes = require('./routes/studentRoutes');
const universityRoutes = require('./routes/universityRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'coopcentral',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/students', studentRoutes);

connectDB()
  .then(async ({ usingMemoryServer }) => {
    if (usingMemoryServer) {
      await seedDatabase();
    }

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Server failed to start.', { error: error.message });
    process.exit(1);
  });
