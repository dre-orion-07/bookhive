import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./shared/errors/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import booksRoutes from "./modules/books/books.routes.js";
import libraryRoutes from "./modules/library/library.routes.js";
import readingProgressRoutes from "./modules/reading-progress/reading-progress.routes.js";
import bookshelvesRoutes from "./modules/bookshelves/bookshelves.routes.js";
import reviewsRoutes from "./modules/reviews/reviews.routes.js";
import recommendationsRoutes from "./modules/recommendations/recommendations.routes.js";
import followsRoutes from "./modules/follows/follows.routes.js";
import clubsRoutes from "./modules/clubs/clubs.routes.js";
import messagingRoutes from "./modules/messaging/messaging.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/books", booksRoutes);
app.use("/api/v1/library", libraryRoutes);
app.use("/api/v1/reading-progress", readingProgressRoutes);
app.use("/api/v1/bookshelves", bookshelvesRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/v1/recommendations", recommendationsRoutes);
app.use("/api/v1/follow", followsRoutes);
app.use("/api/v1/clubs", clubsRoutes);
app.use("/api/v1/notifications", notificationsRoutes);
app.use("/api/v1/messaging", messagingRoutes);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BookHive API is healthy.",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

app.use(errorMiddleware);

export default app;
