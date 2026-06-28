import { FileText, FileSpreadsheet, FileImage, File } from 'lucide-react';
import { detectFileType } from '../../utils/fileType';

const ICONS = {
  pdf: { Icon: FileText, color: 'text-status-rejected' },
  docx: { Icon: FileText, color: 'text-brand-500' },
  xlsx: { Icon: FileSpreadsheet, color: 'text-status-accepted' },
  image: { Icon: FileImage, color: 'text-gold-500' },
  unknown: { Icon: File, color: 'text-ink-400' },
};

const FileTypeIcon = ({ fileNameOrUrl, className = 'h-5 w-5' }) => {
  const { kind } = detectFileType(fileNameOrUrl);
  const { Icon, color } = ICONS[kind] || ICONS.unknown;
  return <Icon className={`${className} ${color}`} />;
};

export default FileTypeIcon;
