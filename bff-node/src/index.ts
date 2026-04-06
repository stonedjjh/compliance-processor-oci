import express, { Application, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import { DocumentAdapter } from './adapters/document.adapter';
import documentRoutes from './routes/document.routes';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Ajustar luego según el puerto de tu React
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;
const docAdapter = new DocumentAdapter();




app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"], // El puerto que uses en React
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/v1/documents', documentRoutes);

const notificationNamespace = io.of('/notifications');
notificationNamespace.on('connection', (socket) => {
  console.log('Cliente conectado al canal de notificaciones');
});


app.use((req: any, res, next) => {
  req.io = notificationNamespace;
  next();
});

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

app.post('/api/v1/webhooks/processing-complete', (req: Request, res: Response) => {
  const { documentId, status, message } = req.body;
    
  notificationNamespace.emit('document_processed', {
    documentId,
    status,
    message,
    timestamp: new Date()
  });

  console.log(`Webhook recibido: Documento ${documentId} ${status}`);
  res.status(200).json({ received: true });
});


app.get('/api/v1/dashboard/summary', async (req: Request, res: Response) => {
  res.json({
    total_documents: 10,
    processed: 8,
    failed: 2,
    service_status: {
      core_python: "UP",
      analysis_flask: "UP"
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`BFF (Express + Socket.io) running on port: ${PORT}`);
});