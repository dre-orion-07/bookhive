import { Router } from "express";
import { libraryController } from "./library.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { validate } from "../../shared/middleware/validate.js";
import { addToLibrarySchema } from "./library.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", libraryController.getLibrary);
router.post("/", validate(addToLibrarySchema), libraryController.addBook);
router.delete("/:bookId", libraryController.removeBook);

export default router;
