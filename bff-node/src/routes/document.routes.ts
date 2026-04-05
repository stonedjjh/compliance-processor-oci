import { Router } from 'express';
import multer from 'multer';
import { 
  uploadDocument, 
  getAllDocuments, 
  getOneDocument,  
  processDocument 
} from '../controllers/document.controller';



const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/', getAllDocuments);
router.get('/:id', getOneDocument);
router.post('/:id/process', processDocument);
router.post('/upload', upload.single('file'), uploadDocument);



export default router;