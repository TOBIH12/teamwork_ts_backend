import multer from 'multer';

const upload = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(gif|jpg|jpeg|png)$/)) {
      cb(new Error('Only GIF, JPG, JPEG, and PNG files are allowed'));
    } else {
      cb(null, true);
    }
  },
});

const uploadedGif = upload.single('gif');

export default uploadedGif;
