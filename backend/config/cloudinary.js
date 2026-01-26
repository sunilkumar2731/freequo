import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Check if Cloudinary is configured
const isConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary if credentials are available
if (isConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✅ Cloudinary configured');
} else {
    console.log('⚠️ Cloudinary not configured - file uploads will use local storage');
}

// Local storage fallback for development
const localStorageDir = path.join(process.cwd(), 'uploads');

// Create uploads directory if it doesn't exist
if (!isConfigured && !fs.existsSync(localStorageDir)) {
    fs.mkdirSync(localStorageDir, { recursive: true });
}

// Local disk storage for fallback
const localDiskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = file.fieldname === 'image' ? 'profiles' :
            file.fieldname === 'resume' ? 'resumes' : 'jobs';
        const uploadPath = path.join(localStorageDir, folder);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Cloudinary storage configurations (only created if configured)
let profileImageStorage, jobAttachmentStorage, resumeStorage;

if (isConfigured) {
    profileImageStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'freequo/profiles',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' }
            ]
        }
    });

    jobAttachmentStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'freequo/jobs',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
            resource_type: 'auto'
        }
    });

    resumeStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'freequo/resumes',
            allowed_formats: ['pdf', 'doc', 'docx'],
            resource_type: 'raw'
        }
    });
}

// Multer upload instances
export const uploadProfileImage = multer({
    storage: isConfigured ? profileImageStorage : localDiskStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

export const uploadJobAttachment = multer({
    storage: isConfigured ? jobAttachmentStorage : localDiskStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

export const uploadResume = multer({
    storage: isConfigured ? resumeStorage : localDiskStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed!'), false);
        }
    }
});

// Helper function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
    if (!isConfigured) {
        console.log('Cloudinary not configured, skipping delete');
        return true;
    }

    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return false;
    }
};

// Helper function to extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    return `${folder}/${filename.split('.')[0]}`;
};

export { isConfigured as isCloudinaryConfigured };
export default cloudinary;
