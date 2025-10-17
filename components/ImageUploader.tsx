
import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  uploadedImage: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
        className="w-full flex flex-col items-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {!uploadedImage ? (
        <div
          onClick={openFileDialog}
          className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-purple-400 hover:bg-gray-800 transition-colors"
        >
          <UploadIcon />
          <p className="mt-2 text-gray-400">Drag & drop your photo here, or click to browse</p>
          <p className="text-sm text-gray-500">PNG, JPG, WEBP</p>
        </div>
      ) : (
        <div className="relative w-full max-w-sm">
          <img src={uploadedImage} alt="User upload" className="rounded-lg shadow-lg w-full h-auto object-cover" />
          <button
            onClick={openFileDialog}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-full shadow-md hover:bg-gray-600 transition-colors text-sm"
          >
            Change Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
