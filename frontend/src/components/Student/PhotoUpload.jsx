import { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentApi } from '../../services/api';

const PhotoUpload = ({ studentId, currentPhoto, onPhotoUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Validate file before upload
  const validateFile = (file) => {
    // Check if file exists
    if (!file) return { valid: false, message: 'No file selected' };
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, message: 'File size must be less than 5MB' };
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, message: 'Only image files are allowed' };
    }
    
    // All checks passed
    return { valid: true };
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.message);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Start upload process
    await uploadPhoto(file);
  };

  // Upload photo to server
  const uploadPhoto = async (file) => {
    // Show loading state
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a fake progress animation for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress; // Cap at 90% until actual completion
        });
      }, 300);
      
      // Upload to server
      const response = await studentApi.uploadPhoto(studentId, file);
      
      // Clear interval and complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Handle response
      if (response.data.success) {
        toast.success('Photo uploaded successfully');
        onPhotoUpdate(response.data.data.photoUrl);
      } else {
        toast.error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Error uploading photo');
    } finally {
      // Reset state after short delay to show completion
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);
    }
  };

  // Trigger file selector
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      {/* Upload button */}
      <button 
        type="button"
        className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-md transition-colors duration-200"
        onClick={triggerFileInput}
        disabled={uploading}
        aria-label="Upload photo"
      >
        {uploading ? (
          <Upload className="h-4 w-4 animate-pulse" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </button>
      
      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload photo"
      />
      
      {/* Upload progress indicator */}
      {uploading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div className="text-white text-xs font-medium">
            {uploadProgress < 100 ? (
              `${Math.round(uploadProgress)}%`
            ) : (
              <CheckCircle className="h-8 w-8 text-green-400 animate-pulse" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;