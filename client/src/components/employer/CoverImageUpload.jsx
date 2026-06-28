import { useRef, useState } from 'react';
import { Camera, Loader2, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { companyService } from '../../services/companyService';

const CoverImageUpload = ({ company, onUpdated }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Cover image must be under 8MB');
      return;
    }

    setUploading(true);
    try {
      const data = await companyService.uploadCoverImage(company._id, file);
      onUpdated(data.company);
      toast.success('Cover image updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload cover image');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div
        className="relative h-40 w-full overflow-hidden rounded-2xl border border-ink-300/60 bg-gradient-to-br from-brand/15 to-gold/10 dark:border-dark-700"
        style={
          company?.coverImage?.url
            ? { backgroundImage: `url(${company.coverImage.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      >
        {!company?.coverImage?.url && (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-ink-300 dark:text-dark-600" />
          </div>
        )}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-ink/70 px-3 py-2 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-ink/85 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          {company?.coverImage?.url ? 'Change cover' : 'Add cover photo'}
        </button>
        <input ref={inputRef} type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleFileChange} />
      </div>
      <p className="mt-2 text-xs text-ink-400 dark:text-ink-300">
        Shown on your company profile and job listings. Recommended: 1200×400px, max 8MB.
      </p>
    </div>
  );
};

export default CoverImageUpload;
