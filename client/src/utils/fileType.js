const EXTENSION_MAP = {
  pdf: { label: 'PDF Document', kind: 'pdf', previewable: true },
  doc: { label: 'Word Document', kind: 'docx', previewable: false },
  docx: { label: 'Word Document', kind: 'docx', previewable: false },
  xls: { label: 'Excel Spreadsheet', kind: 'xlsx', previewable: false },
  xlsx: { label: 'Excel Spreadsheet', kind: 'xlsx', previewable: false },
  csv: { label: 'CSV Spreadsheet', kind: 'xlsx', previewable: false },
  ppt: { label: 'PowerPoint Presentation', kind: 'pptx', previewable: false },
  pptx: { label: 'PowerPoint Presentation', kind: 'pptx', previewable: false },
  txt: { label: 'Text File', kind: 'text', previewable: false },
  png: { label: 'Image', kind: 'image', previewable: true },
  jpg: { label: 'Image', kind: 'image', previewable: true },
  jpeg: { label: 'Image', kind: 'image', previewable: true },
  webp: { label: 'Image', kind: 'image', previewable: true },
  gif: { label: 'Image', kind: 'image', previewable: true },
  mp4: { label: 'Video', kind: 'video', previewable: true },
  mov: { label: 'Video', kind: 'video', previewable: true },
  webm: { label: 'Video', kind: 'video', previewable: true },
  avi: { label: 'Video', kind: 'video', previewable: false },
  mkv: { label: 'Video', kind: 'video', previewable: false },
};

const getExtension = (input) => {
  if (!input) return '';
  const clean = input.split('?')[0].split('#')[0];
  const parts = clean.split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1].toLowerCase();
};

export const detectFileType = (fileNameOrUrl) => {
  const ext = getExtension(fileNameOrUrl);
  return EXTENSION_MAP[ext] || { label: 'Document', kind: 'unknown', previewable: false };
};

export const ACCEPTED_RESUME_EXTENSIONS = '.pdf,.doc,.docx,.xls,.xlsx,.csv';

export const ACCEPTED_RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

export const isAcceptedResumeFile = (file) => {
  if (!file) return false;
  if (ACCEPTED_RESUME_MIME_TYPES.includes(file.type)) return true;
  const ext = getExtension(file.name);
  return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'].includes(ext);
};

export const ACCEPTED_CHAT_ATTACHMENT_EXTENSIONS =
  '.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.webm,.avi,.mkv,.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt';

export const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
