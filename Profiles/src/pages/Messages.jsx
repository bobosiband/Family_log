import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../AuthContext";
import { api } from "../lib/api";
import styles from "./style/Messages.module.css";

const formatTimestamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getId = (obj) => obj?.id || obj?._id || obj?.userId || null;

function SkeletonRow() {
  return (
    <div className={styles.skeletonRow}>
      <div className={styles.skeletonCircle} />
      <div className={styles.skeletonLines}>
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLineShort} />
      </div>
    </div>
  );
}

function ComposeModal({ users, currentUserId, onClose, onSent }) {
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipientId) { setError("Choose a recipient."); return; }
    if (!subject.trim()) { setError("Subject is required."); return; }
    if (subject.trim().length > 200) { setError("Subject must be 200 characters or fewer."); return; }
    if (!content.trim()) { setError("Message cannot be empty."); return; }

    setSending(true);
    setError("");
    try {
      await api.post("/messages", { recipientId, subject: subject.trim(), content: content.trim() });
      onSent();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const recipients = users.filter((u) => getId(u) !== currentUserId);

  return (
    <motion.div
      className={styles.modalBackdrop}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-title"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      >
        <div className={styles.modalHeader}>
          <h2 id="compose-title">New message</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            &#215;
          </button>
        </div>

        <form onSubmit={handleSend} className={styles.composeForm}>
          <div className={styles.formField}>
            <label htmlFor="compose-to">To</label>
            <select
              id="compose-to"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              disabled={sending}
            >
              <option value="">Select a recipient</option>
              {recipients.map((u) => (
                <option key={getId(u)} value={getId(u)}>
                  {u.name ? `${u.name} ${u.surname || ""}`.trim() : u.username} (@{u.username})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="compose-subject">Subject</label>
            <input
              id="compose-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              maxLength={200}
              disabled={sending}
            />
            <span className={styles.charCount}>{subject.length}/200</span>
          </div>

          <div className={styles.formField}>
            <label htmlFor="compose-content">Message</label>
            <textarea
              id="compose-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message..."
              disabled={sending}
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.composeActions}>
            <button type="button" className={styles.ghostBtn} onClick={onClose} disabled={sending}>
              Cancel
            </button>
            <motion.button
              type="submit"
              className={styles.sendBtn}
              disabled={sending}
              whileHover={sending ? {} : { scale: 1.03, y: -1 }}
              whileTap={sending ? {} : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              {sending ? "Sending..." : "Send"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function MessageItem({ message, isSent, onDelete, onMarkRead }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExpand = async () => {
    setExpanded((p) => !p);
    if (!expanded && !isSent && !message.read) {
      await onMarkRead(message.id || message._id);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await onDelete(message.id || message._id);
  };

  return (
    <div className={`${styles.messageItem} ${!isSent && !message.read ? styles.unread : ""}`}>
      <button type="button" className={styles.messageRow} onClick={handleExpand}>
        <div className={styles.messageAvatar}>
          {(isSent ? (message.recipientName || message.recipientUsername || "?") : (message.senderName || message.senderUsername || "?"))[0].toUpperCase()}
        </div>
        <div className={styles.messageMeta}>
          <div className={styles.messageTop}>
            <span className={styles.messagePerson}>
              {isSent
                ? (message.recipientName || `@${message.recipientUsername}` || "Unknown")
                : (message.senderName || `@${message.senderUsername}` || "Unknown")}
            </span>
            <span className={styles.messageTime}>{formatTimestamp(message.createdAt)}</span>
          </div>
          <p className={styles.messageSubject}>{message.subject}</p>
          {!expanded && (
            <p className={styles.messagePreview}>
              {message.content.length > 80 ? `${message.content.slice(0, 80)}...` : message.content}
            </p>
          )}
        </div>
        {!isSent && !message.read && <span className={styles.unreadDot} aria-label="Unread" />}
      </button>

      {expanded && (
        <div className={styles.messageBody}>
          <p>{message.content}</p>
          <div className={styles.messageActions}>
            {confirmDelete ? (
              <>
                <span className={styles.confirmText}>Delete this message?</span>
                <button type="button" className={styles.dangerBtn} onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button type="button" className={styles.ghostBtn} onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className={styles.dangerBtnGhost} onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ConversationThread({ thread, currentUserId }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.threadCard}>
      <button type="button" className={styles.threadHeader} onClick={() => setExpanded((p) => !p)}>
        <div className={styles.messageAvatar}>
          {(thread.partnerUsername || "?")[0].toUpperCase()}
        </div>
        <div className={styles.messageMeta}>
          <div className={styles.messageTop}>
            <span className={styles.messagePerson}>@{thread.partnerUsername}</span>
            <span className={styles.messageTime}>{formatTimestamp(thread.lastMessageAt)}</span>
          </div>
          <p className={styles.messageSubject}>
            {thread.messages?.length ?? 0} message{thread.messages?.length !== 1 ? "s" : ""}
          </p>
          {thread.unreadCount > 0 && (
            <span className={styles.unreadBadge}>{thread.unreadCount} unread</span>
          )}
        </div>
        <span className={styles.chevron}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && thread.messages && (
        <div className={styles.threadMessages}>
          {thread.messages.map((msg) => {
            const isMine = (msg.senderId === currentUserId) || (msg.sender === currentUserId);
            return (
              <div key={msg.id || msg._id} className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleTheirs}`}>
                <p>{msg.content}</p>
                <span className={styles.bubbleTime}>{formatTimestamp(msg.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const TABS = ["inbox", "sent", "conversations"];

export default function Messages() {
  const { user } = useAuth();
  const userId = useMemo(() => getId(user), [user]);

  const [tab, setTab] = useState("inbox");
  const [data, setData] = useState({ inbox: [], sent: [], conversations: [] });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompose, setShowCompose] = useState(false);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!userId) return;
    try {
      if (!silent) setLoading(true);
      setError("");
      const res = await api.get(`/users/${userId}/messages`);
      setData({
        inbox: Array.isArray(res.inbox) ? res.inbox : [],
        sent: Array.isArray(res.sent) ? res.sent : [],
        conversations: Array.isArray(res.conversations) ? res.conversations : [],
      });
    } catch (err) {
      if (!silent) setError(err.message || "Failed to load messages.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), 30000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (!userId) return;
    api.get('/users/all')
      .then((res) => setUsers(Array.isArray(res) ? res : []))
      .catch(() => {});
  }, [userId]);

  const handleMarkRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`, {});
      setData((prev) => ({
        ...prev,
        inbox: prev.inbox.map((m) =>
          (m.id || m._id) === messageId ? { ...m, read: true } : m
        ),
      }));
    } catch {
      // silent — freshness will catch up on next poll
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setData((prev) => ({
        ...prev,
        inbox: prev.inbox.filter((m) => (m.id || m._id) !== messageId),
        sent: prev.sent.filter((m) => (m.id || m._id) !== messageId),
      }));
    } catch (err) {
      setError(err.message || "Failed to delete message.");
    }
  };

  const inboxUnread = data.inbox.filter((m) => !m.read).length;

  const tabLabel = (t) => {
    if (t === "inbox" && inboxUnread > 0) return `Inbox (${inboxUnread})`;
    if (t === "sent") return "Sent";
    if (t === "conversations") return "Threads";
    return "Inbox";
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.skeletonList}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.kicker}>Messages</p>
            <h1>Your mail</h1>
          </div>
          <motion.button
            type="button"
            className={styles.composeBtn}
            onClick={() => setShowCompose(true)}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            Compose
          </motion.button>
        </div>

        {error && <p className={styles.errorBanner}>{error}</p>}

        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => setTab(t)}
            >
              {tabLabel(t)}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {tab === "inbox" && (
            <AnimatePresence mode="wait">
              <motion.div
                key="inbox"
                className={styles.list}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {data.inbox.length === 0 ? (
                  <p className={styles.emptyState}>No messages in your inbox.</p>
                ) : (
                  data.inbox.map((msg, i) => (
                    <motion.div
                      key={msg.id || msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.22 }}
                    >
                      <MessageItem
                        message={msg}
                        isSent={false}
                        onDelete={handleDelete}
                        onMarkRead={handleMarkRead}
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {tab === "sent" && (
            <AnimatePresence mode="wait">
              <motion.div
                key="sent"
                className={styles.list}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {data.sent.length === 0 ? (
                  <p className={styles.emptyState}>No sent messages yet.</p>
                ) : (
                  data.sent.map((msg, i) => (
                    <motion.div
                      key={msg.id || msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.22 }}
                    >
                      <MessageItem
                        message={msg}
                        isSent={true}
                        onDelete={handleDelete}
                        onMarkRead={handleMarkRead}
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {tab === "conversations" && (
            <AnimatePresence mode="wait">
              <motion.div
                key="conversations"
                className={styles.list}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {data.conversations.length === 0 ? (
                  <p className={styles.emptyState}>No conversations yet.</p>
                ) : (
                  data.conversations.map((thread, i) => (
                    <motion.div
                      key={thread.partnerId || thread.partnerUsername}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.22 }}
                    >
                      <ConversationThread
                        thread={thread}
                        currentUserId={userId}
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCompose && (
          <ComposeModal
            users={users}
            currentUserId={userId}
            onClose={() => setShowCompose(false)}
            onSent={fetchMessages}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
