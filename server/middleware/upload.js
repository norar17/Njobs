import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

const memoryStorage = multer.memoryStorage();

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'avi', 'mkv'];
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt'];

export const detectAttachmentType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  return 'document';
};

const buildChatAttachmentStorage = () =>
  new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      const fileType = detectAttachmentType(file.originalname);
      const resourceType = fileType === 'image' ? 'image' : fileType === 'video' ? 'video' : 'raw';

      return {
        folder: 'njobs/chat-attachments',
        resource_type: resourceType,
        type: 'upload',
        access_mode: 'public',
        use_filename: true,
        unique_filename: true,
      };
    },
  });

export const uploadChatAttachment = multer({
  storage: isCloudinaryConfigured ? buildChatAttachmentStorage() : memoryStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...DOCUMENT_EXTENSIONS];
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (allowedExtensions.includes(ext)) return cb(null, true);
    cb(new Error('This file type is not supported'));
  },
});

const buildCloudinaryStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      const ext = file.originalname.split('.').pop().toLowerCase();
      const isImage = IMAGE_EXTENSIONS.includes(ext);

      return {
        folder: `njobs/${folder}`,
        resource_type: isImage ? 'image' : 'raw',
        type: 'upload',
        access_mode: 'public',
        use_filename: true,
        unique_filename: true,
      };
    },
  });

export const uploadAvatar = multer({
  storage: isCloudinaryConfigured ? buildCloudinaryStorage('avatars') : memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Please upload a JPG, PNG, or WEBP image'));
  },
});

export const uploadResume = multer({
  storage: isCloudinaryConfigured ? buildCloudinaryStorage('resumes') : memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'];
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (allowedExtensions.includes(ext)) return cb(null, true);
    cb(new Error('Please upload a PDF, Word, or Excel document'));
  },
});

export const uploadLogo = multer({
  storage: isCloudinaryConfigured ? buildCloudinaryStorage('logos') : memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Please upload a JPG, PNG, or WEBP image'));
  },
});

export const uploadCoverImage = multer({
  storage: isCloudinaryConfigured ? buildCloudinaryStorage('covers') : memoryStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Please upload a JPG, PNG, or WEBP image'));
  },
});
