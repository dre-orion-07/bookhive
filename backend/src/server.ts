import "dotenv/config";
import http from "http";
import app from "./app.js";
import { setupMessagingSocket } from "./modules/messaging/messaging.socket.js";
import { setupNotificationsSocket } from "./modules/notifications/notifications.socket.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// attach socket.io
const io = setupMessagingSocket(server);
setupNotificationsSocket(io);

server.listen(PORT, () => {
  console.log(`BookHive API running on http://localhost:${PORT}`);
});
