import mongoose from 'mongoose';

const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export function getHealth(req, res) {
  const readyState = mongoose.connection.readyState;
  const database = CONNECTION_STATES[readyState] ?? 'unknown';

  res.status(200).json({
    success: true,
    message: 'StudyOS API is running',
    database,
  });
}