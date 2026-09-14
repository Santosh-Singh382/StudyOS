import 'dotenv/config';

const missing = ['PORT', 'MONGO_URI', 'CLIENT_URL'].filter(
  (key) => !process.env[key]
);
if (missing.length > 0) {
  console.warn(`Missing environment variables: ${missing.join(', ')}`);
}

export const env = Object.freeze({
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
});