import "dotenv/config";
import http from "http";
import app from "./app.js";
import { setupMessagingSocket } from "./modules/messaging/messaging.socket.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// attach socket.io
setupMessagingSocket(server);

server.listen(PORT, () => {
  console.log(`BookHive API running on http://localhost:${PORT}`);
});
