import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const storageProvider = {
  uploadImage: async (fileBuffer: Buffer, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `bookhive/${folder}`,
          resource_type: "image",
          transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error ?? new Error("Upload failed with no result."));
          }
          resolve(result.secure_url);
        }
      );

      uploadStream.end(fileBuffer);
    });
  },
};
