import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import { DocumentAdapter } from './adapters/document.adapter';
import documentRoutes from './routes/document.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const docAdapter = new DocumentAdapter();


app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/v1/documents', documentRoutes);

app.get('/health', async (req: Request, res: Response) => {
  const isCoreUp = await docAdapter.checkCoreHealth();
  
  res.status(isCoreUp ? 200 : 503).json({
    status: isCoreUp ? 'UP' : 'DEGRADED',
    services: {
      bff: 'OK',
      core: isCoreUp ? 'OK' : 'ERROR'
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`BFF port: ${PORT}`);
});