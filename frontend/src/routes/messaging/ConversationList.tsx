import { useEffect, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { Link } from "react-router";
// presence handled in ChatPage; keep list simple

type Conversation = {
  id: string;
  title?: string | null;
  participantIds: string[];
  lastMessageId?: string | null;
};

export default function ConversationList() {
  const [convs, setConvs] = useState<Conversation[]>([]);

  useEffect(() => {
    apiClient
      .get(`/messaging/conversations`)
      .then((r) => setConvs(r.data.data as Conversation[]))
      .catch(() => setConvs([]));
  }, []);

  return (
    <div>
      <h2>Conversations</h2>
      <ul>
        {convs.length === 0 && <li aria-live="polite">No conversations yet.</li>}
        {convs.map((c: Conversation) => (
          <li key={c.id}>
            <Link to={`/messages/${c.id}`} aria-label={`Open conversation ${c.title ?? c.id}`}>
              <div>{c.title ?? "(untitled)"}</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {c.lastMessageId ? "Recent message" : "No messages"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
