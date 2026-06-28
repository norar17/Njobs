import { useRef, useState } from 'react';
import { Camera, Loader2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { companyService } from '../../services/companyService';

const CompanyLogoUpload = ({ company, onUpdated }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const data = await companyService.uploadLogo(company._id, file);
      onUpdated(data.company);
      toast.success('Logo updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 flex-shrink-0">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-ink-300 bg-brand/10 text-2xl font-bold text-brand-500 dark:border-dark-700">
          {company?.logo?.url ? (
            <img src={company.logo.url} alt={company.companyName} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-8 w-8" />
          )}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white shadow-glow transition-colors hover:bg-brand-400 disabled:opacity-50"
          aria-label="Change company logo"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
        </button>
        <input ref={inputRef} type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleFileChange} />
      </div>
      <div>
        <p className="text-sm font-medium text-ink dark:text-paper-100">Company logo</p>
        <p className="text-xs text-ink-400 dark:text-ink-300">JPG, PNG, or WEBP. Max 5MB.</p>
      </div>
    </div>
  );
};

export default CompanyLogoUpload;
