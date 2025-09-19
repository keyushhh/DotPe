import 'dotenv/config';
import express from 'express';
import healthRouter from './routes/health';
import otpRouter from './routes/otp';

const app = express();
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/v1/otp', otpRouter);

app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'DotPe API', version: 'v1' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`🚀 DotPe API running on http://localhost:${port}`);
});
