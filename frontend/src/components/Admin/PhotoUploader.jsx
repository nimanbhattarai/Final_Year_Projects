import { useRef, useState } from 'react';
import { Camera, User } from 'lucide-react';

const PhotoUploader = ({ onPhotoSelect, currentPhoto = null }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-2">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm bg-gray-100 flex items-center justify-center">
          {currentPhoto ? (
            <img 
              src={currentPhoto} 
              alt="Student" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <button 
          type="button"
          className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full shadow-md transition-colors duration-200"
          onClick={triggerFileInput}
        >
          <Camera className="h-3 w-3" />
        </button>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <p className="text-xs text-gray-500 mt-1">Student photo (optional)</p>
    </div>
  );
};

export default PhotoUploader; 