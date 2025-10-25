const express = require('express');
const multer = require('multer');
const path = require('path');
const moduleController = require('../controllers/moduleController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    require('fs-extra').ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept both mime types and .zip extension
    const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
    const isZipFile = allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.zip');

    if (isZipFile) {
      cb(null, true);
    } else {
      cb(new Error('Only zip files are allowed!'), false);
    }
  }
});

// Routes
router.get('/', moduleController.getAllModules);
router.get('/:id', moduleController.getModuleById);
router.post('/upload', upload.single('module'), moduleController.uploadModule);
router.post('/:id/execute', moduleController.executeModule);
router.post('/:id/reload', moduleController.reloadModules);
router.put('/:id/toggle', moduleController.toggleModule);
router.delete('/:id', moduleController.deleteModule);

module.exports = router;