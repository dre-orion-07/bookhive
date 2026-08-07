import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "../shared/stores/authStore";

type ConnectionListener = (connected: boolean) => void;
type PresenceListener = (payload: { userId: string; online: boolean }) => void;

let socket: Socket | null = null;
const connectionListeners = new Set<ConnectionListener>();
const presenceListeners = new Set<PresenceListener>();

function notifyConnection(connected: boolean) {
  connectionListeners.forEach((cb) => cb(connected));
}

function notifyPresence(payload: { userId: string; online: boolean }) {
  presenceListeners.forEach((cb) => cb(payload));
}

export function connectSocket() {
  const token = useAuthStore.getState().accessToken;
  if (!token) return null;
  if (socket && socket.connected) return socket;
  socket = io("http://localhost:5000", { auth: { token } });

  socket.on("connect", () => notifyConnection(true));
  socket.on("disconnect", () => notifyConnection(false));
  socket.on("connect_error", () => notifyConnection(false));

  socket.on("presence.update", (p: { userId: string; online: boolean }) => {
    notifyPresence(p);
  });

  return socket;
}

export function onConnectionChange(cb: ConnectionListener) {
  connectionListeners.add(cb);
  return () => {
    connectionListeners.delete(cb);
  };
}

export function onPresenceUpdate(cb: PresenceListener) {
  presenceListeners.add(cb);
  return () => {
    presenceListeners.delete(cb);
  };
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    notifyConnection(false);
  }
}
