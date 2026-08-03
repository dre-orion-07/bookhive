import { Router } from "express";
import { bookshelvesController } from "./bookshelves.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { validate } from "../../shared/middleware/validate.js";
import { createBookshelfSchema, addBookToShelfSchema } from "./bookshelves.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", bookshelvesController.list);
router.post("/", validate(createBookshelfSchema), bookshelvesController.create);
router.delete("/:id", bookshelvesController.delete);
router.post("/:id/books", validate(addBookToShelfSchema), bookshelvesController.addBook);
router.delete("/:id/books/:bookId", bookshelvesController.removeBook);

export default router;
