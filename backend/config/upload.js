import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, file.fieldname === 'resume' ? 'resumes' : 'photos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname) || '.pdf');
  },
});

const fileFilter = (req, file, cb) => {
  const allowedResume = ['.pdf', '.doc', '.docx'];
  const allowedPhoto = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === 'resume' && allowedResume.includes(ext)) return cb(null, true);
  if (file.fieldname === 'photo' && allowedPhoto.includes(ext)) return cb(null, true);
  if (file.fieldname === 'logo' && allowedPhoto.includes(ext)) return cb(null, true);
  cb(new Error('Invalid file type'));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
