import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader, CheckCircle } from 'lucide-react';
import { uploadAPI } from '../../services/api';
import './ImageUpload.css';

const ImageUpload = ({
    currentImage,
    onUploadSuccess,
    onUploadError,
    type = 'profile', // 'profile' | 'job' | 'resume'
    jobId = null,
    accept = 'image/*',
    maxSize = 5 // MB
}) => {
    const [preview, setPreview] = useState(currentImage);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`);
            return;
        }

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }

        // Upload file
        setUploading(true);
        setError(null);
        setSuccess(false);

        try {
            let result;
            switch (type) {
                case 'profile':
                    result = await uploadAPI.uploadProfileImage(file);
                    break;
                case 'job':
                    if (!jobId) throw new Error('Job ID required for job attachments');
                    result = await uploadAPI.uploadJobAttachment(jobId, file);
                    break;
                case 'resume':
                    result = await uploadAPI.uploadResume(file);
                    break;
                default:
                    throw new Error('Invalid upload type');
            }

            setSuccess(true);
            if (onUploadSuccess) {
                onUploadSuccess(result.data);
            }

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);

        } catch (err) {
            const errorMessage = err.message || 'Upload failed';
            setError(errorMessage);
            if (onUploadError) {
                onUploadError(err);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleClick = () => {
        if (!uploading) {
            fileInputRef.current?.click();
        }
    };

    const handleRemove = async () => {
        if (preview && onUploadSuccess) {
            try {
                await uploadAPI.deleteUpload(preview, type === 'profile' ? 'avatar' : type);
                setPreview(null);
                onUploadSuccess({ url: null });
            } catch (err) {
                setError('Failed to remove image');
            }
        }
    };

    return (
        <div className="image-upload">
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <div
                className={`upload-area ${uploading ? 'uploading' : ''} ${preview ? 'has-preview' : ''}`}
                onClick={handleClick}
            >
                {uploading ? (
                    <div className="upload-loading">
                        <Loader className="spinner" size={32} />
                        <span>Uploading...</span>
                    </div>
                ) : preview ? (
                    <div className="preview-container">
                        {type === 'resume' ? (
                            <div className="file-preview">
                                <span className="file-icon">📄</span>
                                <span className="file-name">Resume uploaded</span>
                            </div>
                        ) : (
                            <img src={preview} alt="Preview" className="image-preview" />
                        )}
                        <button
                            className="remove-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                        >
                            <X size={16} />
                        </button>
                        <div className="change-overlay">
                            <Upload size={24} />
                            <span>Change</span>
                        </div>
                    </div>
                ) : (
                    <div className="upload-placeholder">
                        {type === 'profile' ? (
                            <ImageIcon size={40} />
                        ) : (
                            <Upload size={40} />
                        )}
                        <span className="upload-text">
                            {type === 'profile' && 'Upload Profile Photo'}
                            {type === 'job' && 'Upload Attachment'}
                            {type === 'resume' && 'Upload Resume (PDF)'}
                        </span>
                        <span className="upload-hint">
                            Click to browse or drag & drop
                        </span>
                    </div>
                )}
            </div>

            {success && (
                <div className="upload-success">
                    <CheckCircle size={16} />
                    <span>Uploaded successfully!</span>
                </div>
            )}

            {error && (
                <div className="upload-error">
                    <X size={16} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
