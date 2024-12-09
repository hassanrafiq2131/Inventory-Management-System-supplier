import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory for easy access
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit files to 2MB
});

export default upload;
