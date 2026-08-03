import { Router } from "express";
import { booksController } from "./books.controller.js";

const router = Router();

router.get("/search", booksController.search);
router.get("/:id", booksController.getById);

export default router;
