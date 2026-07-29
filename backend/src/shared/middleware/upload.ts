import multer from "multer";
import { ErrorFactory } from "../errors/ErrorFactory.js";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(ErrorFactory.validation("Only PNG, JPEG, and WEBP images are allowed."));
    }
    callback(null, true);
  },
});
