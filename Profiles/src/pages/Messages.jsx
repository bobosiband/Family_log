import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import styles from "./style/Messages.module.css";

export default function Messages() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("inbox");
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedMessageId, setExpandedMessageId] = useState(null);

  useEffect(() => {
    async function loadMessages() {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/messages`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load messages.");
        }
        setInbox(Array.isArray(data.inbox) ? data.inbox : []);
        setSent(Array.isArray(data.sent) ? data.sent : []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load messages.");
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [user?.id]);

  const handleExpandMessage = async (messageId) => {
    setExpandedMessageId((current) => (current === messageId ? null : messageId));

    if (expandedMessageId !== messageId && user?.id) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}/read`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        if (!response.ok) return;
        setInbox((current) => current.map((message) => (message.id === messageId ? { ...message, read: true } : message)));
      } catch (err) {
        console.error("Failed to mark message as read:", err);
      }
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>Messages</h1>
            <p>Loading messages...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Messages</h1>
          <p>Connect with your family through direct messages</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "inbox" ? styles.active : ""}`}
            onClick={() => setActiveTab("inbox")}
          >
            Inbox
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "sent" ? styles.active : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            Sent
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "inbox" && (
            <div className={styles.messagesContainer}>
              {inbox.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No messages yet.</p>
                </div>
              ) : (
                inbox.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.messageCard} ${!message.read ? styles.unread : ""}`}
                    onClick={() => handleExpandMessage(message.id)}
                  >
                    <div className={styles.messageHeader}>
                      <div className={styles.senderInfo}>
                        <span className={styles.subject}>{message.subject}</span>
                      </div>
                      <span className={styles.date}>{formatDate(message.createdAt)}</span>
                    </div>

                    {expandedMessageId === message.id && (
                      <div className={styles.messageContent}>
                        <p>{message.content}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "sent" && (
            <div className={styles.messagesContainer}>
              {sent.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No messages yet.</p>
                </div>
              ) : (
                sent.map((message) => (
                  <div key={message.id} className={styles.messageCard}>
                    <div className={styles.messageHeader}>
                      <div className={styles.senderInfo}>
                        <span className={styles.subject}>{message.subject}</span>
                      </div>
                      <span className={styles.date}>{formatDate(message.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
