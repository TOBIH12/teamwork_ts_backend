import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import { extractPublicId } from 'cloudinary-build-url';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const cloudinaryConfig = cloudinary.v2;

export async function handleCloudinaryUpload(file: string, folder: string) {
  const res = await cloudinaryConfig.uploader.upload(file, {
    resource_type: 'auto',
    folder: folder,
    public_id: `${Date.now()}`,
  });

  return res;
}

export async function handleCloudinaryFileDelete(file: string) {
  const public_id = extractPublicId(file);

  try {
    const result = await cloudinaryConfig.uploader
    .destroy(public_id, {
      resource_type: 'image',
    });
    return result;
  } catch (err: unknown) {
     console.error('Error deleting Cloudinary file', { file, public_id, err });
     throw err;
  }
}
