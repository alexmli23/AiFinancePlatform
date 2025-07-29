import { v2 as cloudinary } from 'cloudinary'
import { Env } from './env.config'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

cloudinary.config({
    cloud_name: Env.CLOUDINARY_CLOUD_NAME,
    api_key: Env.CLOUDINARY_API_KEY,
    api_secret: Env.CLOUDINARY_API_SECRET
})

const STORAGE_PARAMS = {
    folder: "images",
    allowed_formats: ['jpg', 'png','jpeg'],
    resource_type: "image" as const,
    quality: "auto:good" as const
}

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
        ...STORAGE_PARAMS
    })
})