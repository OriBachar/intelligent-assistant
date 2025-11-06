import express from 'express';
import { connectDB } from './config/database';
import { config } from './config/env';
import middleware from './middleware/middleware';
import errorHandler from './middleware/errorHandler';
import indexRoutes from './routes/index';

const app = express();

app.use(middleware);
app.use('/api', indexRoutes);
app.use(errorHandler);

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  if (config.server.env === 'production') {
      console.error('Critical error, shutting down...');
      process.exit(1);
  }
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  if (config.server.env === 'production') {
      console.error('Critical error, shutting down...');
      process.exit(1);
  }
});

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});