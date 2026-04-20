import { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export const ImageDropzone = ({ onImageChange }: { onImageChange: (base64str: string | null) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DRAG AND DROP HANDLERS ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Tolong upload file gambar (JPG, PNG).");
      return;
    }

    // Check file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB.");
      return;
    }

    // Create preview and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64str = reader.result as string;
      setPreview(base64str);
      onImageChange(base64str);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-200
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
      `}
    >
      <input
        type="file"
        accept="image/png, image/jpeg"
        ref={fileInputRef}
        onChange={(e) => e.target.files && processFile(e.target.files[0])}
        className="hidden"
      />

      {preview ? (
        <img src={preview} alt="Thumbnail Preview" className="w-full h-full object-cover" />
      ) : (
        <div className="text-center p-6">
          <UploadCloud className={`w-10 h-10 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-sm font-semibold text-gray-700">Klik atau drag & drop gambar ke sini</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, max 5MB</p>
        </div>
      )}
    </div>
  );
};
