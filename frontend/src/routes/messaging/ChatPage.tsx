import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import type { Message as ApiMessage } from "../../modules/messaging/messaging.service";
import { messagingApi } from "../../modules/messaging/messaging.service";
import { connectSocket, onConnectionChange } from "../../lib/socketClient.js";

type Message = ApiMessage & { clientId?: string; status?: "sending" | "sent" | "failed" };

export default function ChatPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);
  const [connected, setConnected] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagingApi
      .getMessages(id!)
      .then((msgs: ApiMessage[]) =>
        setMessages(msgs.map((m) => ({ ...m, status: "sent" as const })) as Message[])
      )
      .catch(() => setMessages([]));

    const s = connectSocket();
    socketRef.current = s;
    s?.emit("conversation.join", id);

    s?.on("message.created", (msg: Message) => {
      if (msg.conversationId === id) {
        setMessages((m) => {
          // replace optimistic message with same clientId
          if (msg.clientId) {
            const exists = m.find((x) => x.clientId === msg.clientId);
            if (exists) {
              return m.map((x) => (x.clientId === msg.clientId ? { ...msg, status: "sent" } : x));
            }
          }
          return [...m, { ...msg, status: "sent" }];
        });
        // auto-scroll
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      }
    });

    s?.on("typing", () => {
      // TODO: show typing indicator
    });

    const offConn = onConnectionChange((c) => setConnected(c));

    return () => {
      s?.emit("conversation.leave", id);
      offConn();
    };
  }, [id]);

  const send = () => {
    if (!text) return;
    const clientId = `local:${Date.now()}`;
    const optimistic: Message = {
      id: clientId,
      clientId,
      conversationId: id!,
      senderId: "me",
      content: text,
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    setMessages((m) => [...m, optimistic]);
    setText("");

    socketRef.current?.emit(
      "message.create",
      { conversationId: id, content: optimistic.content, clientId },
      (res?: { success: boolean } | undefined) => {
        if (!res || !res.success) {
          setMessages((m) =>
            m.map((x) => (x.clientId === clientId ? { ...x, status: "failed" } : x))
          );
        }
      }
    );
  };

  const retry = (msg: Message) => {
    if (!msg.clientId) return;
    setMessages((m) =>
      m.map((x) => (x.clientId === msg.clientId ? { ...x, status: "sending" } : x))
    );
    socketRef.current?.emit(
      "message.create",
      { conversationId: id, content: msg.content, clientId: msg.clientId },
      (res?: { success: boolean } | undefined) => {
        if (!res || !res.success) {
          setMessages((m) =>
            m.map((x) => (x.clientId === msg.clientId ? { ...x, status: "failed" } : x))
          );
        }
      }
    );
  };

  return (
    <div>
      <h3>Chat</h3>
      <div
        ref={listRef}
        style={{ height: 400, overflow: "auto", border: "1px solid #ddd", padding: 8 }}
      >
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>{m.senderId}</div>
            <div>{m.content}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "#999" }}>
                {new Date(m.createdAt).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: m.status === "failed" ? "#d00" : "#666" }}>
                {m.status}
              </div>
              {m.status === "failed" && (
                <button onClick={() => retry(m)} aria-label="Retry message">
                  Retry
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <label htmlFor="message-input" className="sr-only">
          Message
        </label>
        <input
          id="message-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "80%" }}
          aria-label="Message input"
        />
        <button onClick={send} aria-label="Send message">
          Send
        </button>
      </div>
      <div aria-live="polite" style={{ marginTop: 8 }}>
        Connection: {connected ? "online" : "offline"}
      </div>
    </div>
  );
}
