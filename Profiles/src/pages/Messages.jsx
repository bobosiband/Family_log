import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import styles from "./style/Messages.module.css";

const normalizeUsername = (value) => value?.toString().trim().replace(/^@/, "").toLowerCase();
const getUserId = (profile) => profile?.id || profile?._id || profile?.userId || null;

const formatTimestamp = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatPreview = (value) => {
  if (!value) return "No messages yet";
  return value.length > 52 ? `${value.slice(0, 52)}…` : value;
};

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [pendingRecipient, setPendingRecipient] = useState(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const requestedUsername = useMemo(() => normalizeUsername(searchParams.get("with")), [searchParams]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.partnerId === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const activeConversation = useMemo(() => {
    if (selectedConversation) {
      return selectedConversation;
    }

    if (!pendingRecipient) {
      return null;
    }

    return {
      partnerId: pendingRecipient.id,
      partnerUsername: pendingRecipient.username,
      partnerName: pendingRecipient.name || "",
      partnerSurname: pendingRecipient.surname || "",
      unreadCount: 0,
      lastMessageAt: null,
      lastMessagePreview: "",
      messages: [],
    };
  }, [pendingRecipient, selectedConversation]);

  const hasChatOpen = Boolean(activeConversation);

  const visibleMessages = activeConversation?.messages || [];

  const refreshConversations = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/messages`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load messages.");
      }

      const nextConversations = Array.isArray(data.conversations) ? data.conversations : [];
      setConversations(nextConversations);

      setSelectedConversationId((currentId) => {
        if (currentId !== null && nextConversations.some((conversation) => conversation.partnerId === currentId)) {
          return currentId;
        }

        return null;
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load messages.");
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    let isActive = true;

    const loadMessages = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        setError("");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/messages`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load messages.");
        }

        const nextConversations = Array.isArray(data.conversations) ? data.conversations : [];
        if (!isActive) return;

        setConversations(nextConversations);
        setSelectedConversationId((currentId) => {
          if (currentId !== null && nextConversations.some((conversation) => conversation.partnerId === currentId)) {
            return currentId;
          }

          return null;
        });
      } catch (err) {
        if (!isActive) return;
        console.error(err);
        setError(err.message || "Failed to load messages.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadMessages();
    const interval = setInterval(() => loadMessages(true), 10000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !requestedUsername) {
      setPendingRecipient(null);
      return;
    }

    let isActive = true;

    const resolveRecipient = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/all`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || "Failed to resolve conversation.");
        }

        const data = await response.json();
        const users = Array.isArray(data) ? data : [];
        const found = users.find((candidate) => normalizeUsername(candidate.username) === requestedUsername);

        if (!isActive || !found) return;

        setPendingRecipient({
          id: getUserId(found),
          username: found.username || "",
          name: found.name || "",
          surname: found.surname || "",
        });
      } catch (err) {
        if (!isActive) return;
        console.error(err);
        setError(err.message || "Failed to resolve conversation.");
      }
    };

    resolveRecipient();

    return () => {
      isActive = false;
    };
  }, [requestedUsername, user?.id]);

  useEffect(() => {
    if (!pendingRecipient) return;

    const matchedConversation = conversations.find(
      (conversation) => normalizeUsername(conversation.partnerUsername) === normalizeUsername(pendingRecipient.username)
    );

    if (matchedConversation) {
      setSelectedConversationId(matchedConversation.partnerId);
      setPendingRecipient(null);
    }
  }, [conversations, pendingRecipient]);

  const handleSelectConversation = (partnerId) => {
    setSelectedConversationId(partnerId);
    setPendingRecipient(null);
    setError("");

    const selectedThread = conversations.find((conversation) => conversation.partnerId === partnerId);
    if (selectedThread?.partnerUsername) {
      setSearchParams({ with: selectedThread.partnerUsername });
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!activeConversation || !draftMessage.trim()) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          recipientId: activeConversation.partnerId,
          subject: activeConversation.partnerUsername,
          content: draftMessage.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send message.");
      }

      setDraftMessage("");
      await refreshConversations();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.loadingState}>Loading conversations...</div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={`${styles.shell} ${hasChatOpen ? styles.chatOpen : ""}`}>
        <aside className={styles.sidebar}>
          <div className={styles.header}>
            <p className={styles.kicker}>Messages</p>
            <h1>Chat with your family</h1>
            <p>Pick a thread on the left to keep the conversation going.</p>
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.threadList}>
            {conversations.length === 0 ? (
              <div className={styles.emptyThreadList}>
                <h2>No conversations yet</h2>
                <p>Your threads will appear here once someone starts a chat with you.</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const isActive = conversation.partnerId === selectedConversationId;
                return (
                  <button
                    key={conversation.partnerId}
                    type="button"
                    className={`${styles.threadCard} ${isActive ? styles.threadActive : ""}`}
                    onClick={() => handleSelectConversation(conversation.partnerId)}
                  >
                    <div className={styles.threadAvatar}>
                      {conversation.partnerUsername?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className={styles.threadBody}>
                      <div className={styles.threadTopRow}>
                        <span className={styles.threadName}>@{conversation.partnerUsername}</span>
                        <span className={styles.threadTime}>{formatTimestamp(conversation.lastMessageAt)}</span>
                      </div>
                      <p className={styles.threadPreview}>{formatPreview(conversation.lastMessagePreview)}</p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className={styles.unreadBadge}>{conversation.unreadCount}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className={styles.chatPanel}>
          {activeConversation ? (
            <div className={styles.chatCard}>
              <header className={styles.chatHeader}>
                <button
                  type="button"
                  className={styles.backButton}
                    onClick={() => {
                      setSelectedConversationId(null);
                      setPendingRecipient(null);
                      setSearchParams({});
                    }}
                >
                  ← Threads
                </button>
                <div>
                  <p className={styles.chatKicker}>Conversation</p>
                  <h2>@{activeConversation.partnerUsername}</h2>
                </div>
                <div className={styles.chatMeta}>
                  {activeConversation.unreadCount > 0 ? (
                    <span>{activeConversation.unreadCount} unread</span>
                  ) : (
                    <span>{activeConversation.messages.length} messages</span>
                  )}
                </div>
              </header>

              <div className={styles.messageFeed}>
                {visibleMessages.length === 0 ? (
                  <div className={styles.emptyChatState}>
                    <h3>Start the conversation</h3>
                    <p>Send the first message in this thread using the composer below.</p>
                  </div>
                ) : (
                  visibleMessages.map((message) => {
                    const isSent = message.senderId === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`${styles.messageRow} ${isSent ? styles.sentRow : styles.receivedRow}`}
                      >
                        <article className={`${styles.bubble} ${isSent ? styles.sentBubble : styles.receivedBubble}`}>
                          <p className={styles.messageText}>{message.content}</p>
                          <span className={styles.timestamp}>{formatTimestamp(message.createdAt)}</span>
                        </article>
                      </div>
                    );
                  })
                )}
              </div>

              <form className={styles.composer} onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className={styles.composerInput}
                  value={draftMessage}
                  onChange={(event) => setDraftMessage(event.target.value)}
                  placeholder={`Message @${activeConversation.partnerUsername}...`}
                  disabled={sending}
                />
                <button type="submit" className={styles.sendButton} disabled={sending || !draftMessage.trim()}>
                  {sending ? "Sending…" : "Send"}
                </button>
              </form>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateCard}>
                <p className={styles.chatKicker}>Messages</p>
                <h2>Choose a conversation</h2>
                <p>
                  Your chats will appear here as bubble threads. Select one from the sidebar to read and reply in the same
                  thread.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}