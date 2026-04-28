import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import styles from "./style/UserProfile.module.css";

const normalizeUsername = (value) => value?.toString().trim().replace(/^@/, "").toLowerCase();
const formatDate = (value) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const completionScore = (profile) => {
  if (!profile) return 0;
  const fields = ["name", "surname", "username", "email", "bio", "profilePictureUrl"];
  const filled = fields.reduce((count, field) => {
    const value = profile[field];
    if (!value) return count;
    return count + (typeof value === "string" ? Boolean(value.trim()) : 1);
  }, 0);
  return Math.round((filled / fields.length) * 100);
};

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [messageForm, setMessageForm] = useState({ subject: "", content: "" });
  const [messageStatus, setMessageStatus] = useState({ loading: false, success: "", error: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      setProfile(null);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/all`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || "Unable to load profile.");
        }

        const data = await response.json();
        const users = Array.isArray(data) ? data : [];
        const found = users.find((item) => normalizeUsername(item.username) === normalizeUsername(username));

        if (!found) {
          setError("We couldn't find that family profile.");
          return;
        }

        setProfile(found);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong while loading the profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const isOwnProfile = useMemo(
    () => Boolean(currentUser && profile && normalizeUsername(currentUser.username) === normalizeUsername(profile.username)),
    [currentUser, profile]
  );

  const handleSendMessage = async () => {
    if (!currentUser || !profile) return;
    const { subject, content } = messageForm;
    if (!subject.trim() || !content.trim()) {
      setMessageStatus({ loading: false, success: "", error: "Subject and message cannot be empty." });
      return;
    }
    setMessageStatus({ loading: true, success: "", error: "" });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id || currentUser._id || currentUser.userId,
          recipientId: profile.id || profile._id || profile.userId,
          subject: subject.trim(),
          content: content.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message.');
      }
      setMessageStatus({ loading: false, success: 'Message sent!', error: '' });
      setMessageForm({ subject: '', content: '' });
      setTimeout(() => setShowCompose(false), 1500);
    } catch (err) {
      setMessageStatus({ loading: false, success: '', error: err.message });
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingCard}>
          <div className={styles.spinner} />
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.emptyCard}>
          <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
            ← Go back
          </button>
          <h2>Profile not available</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  const profileCompletion = completionScore(profile);

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
          ← Back to family
        </button>
      </div>

      <section className={styles.profileHeader}>
        <div className={styles.profileHero}>
          <div className={styles.avatarFrame}>
            <img
              src={profile.profilePictureUrl || "https://via.placeholder.com/260?text=Profile"}
              alt={profile.username}
              className={styles.avatar}
            />
          </div>
          <div className={styles.headerCopy}>
            <div className={styles.badgeRow}>
              <span className={styles.statusPill}>Family profile</span>
              <span className={styles.completionPill}>{profileCompletion}% complete</span>
            </div>
            <h1>{`${profile.name || "Family"} ${profile.surname || "Member"}`.trim()}</h1>
            <p className={styles.handle}>@{profile.username || "unknown"}</p>
            <p className={styles.profileBio}>{profile.bio || "This family profile is still being shaped with memories and stories."}</p>
            <div className={styles.heroActions}>
              {isOwnProfile ? (
                <button type="button" className={styles.primaryButton} onClick={() => navigate("/profile/edit")}>Edit profile</button>
              ) : (
                <>
                  <button type="button" className={styles.secondaryButton} onClick={() => setShowCompose((prev) => !prev)}>
                    {showCompose ? 'Cancel' : 'Send message'}
                  </button>
                </>
              )}
            </div>
            {showCompose && !isOwnProfile && (
              <div className={styles.composePanel}>
                <label>
                  Subject
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="What's this about?"
                  />
                </label>
                <label>
                  Message
                  <textarea
                    rows={4}
                    value={messageForm.content}
                    onChange={(e) => setMessageForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Write something..."
                  />
                </label>
                {messageStatus.error && <p className={styles.errorText}>{messageStatus.error}</p>}
                {messageStatus.success && <p className={styles.successText}>{messageStatus.success}</p>}
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={messageStatus.loading}
                  onClick={handleSendMessage}
                >
                  {messageStatus.loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.cardGrid}>
        <div className={styles.infoCard}>
          <h2>Profile details</h2>
          <div className={styles.detailRow}>
            <span>Full name</span>
            <p>{`${profile.name || "-"} ${profile.surname || ""}`.trim()}</p>
          </div>
          <div className={styles.detailRow}>
            <span>Username</span>
            <p>@{profile.username || "-"}</p>
          </div>
          <div className={styles.detailRow}>
            <span>Member since</span>
            <p>{formatDate(profile.memberSince || profile.createdAt || profile.joinedAt || profile.created)}</p>
          </div>
          <div className={styles.detailRow}>
            <span>Email</span>
            <p>{profile.email || "Hidden"}</p>
          </div>
          <div className={styles.detailRow}>
            <span>Account status</span>
            <p>{profile.status || "Active"}</p>
          </div>
        </div>

        <div className={styles.statsCard}>
          <h2>Family highlights</h2>
          <p className={styles.statsCopy}>A snapshot of how complete this profile is and when it was last updated.</p>
          <div className={styles.statRow}>
            <div>
              <span>Completion</span>
              <strong>{profileCompletion}%</strong>
            </div>
            <div>
              <span>Joined</span>
              <strong>{formatDate(profile.createdAt || profile.joinedAt || profile.created)}</strong>
            </div>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${profileCompletion}%` }} />
          </div>
          <div className={styles.statRow}>
            <div>
              <span>Last update</span>
              <strong>{formatDate(profile.updatedAt || profile.lastUpdated || profile.modifiedAt)}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{profile.status || "Active"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.actionCard}>
        <div>
          <h2>Need help next?</h2>
          <p>Use these quick actions to keep the profile current or connect with this family member.</p>
        </div>
        <div className={styles.actionRow}>
          <button type="button" className={styles.secondaryButton} onClick={() => navigate(-1)}>
            Back to browse
          </button>
          {isOwnProfile ? (
            <button type="button" className={styles.primaryButton} onClick={() => navigate("/profile/edit")}>Update profile</button>
          ) : (
            <button type="button" className={styles.primaryButton} onClick={() => setShowCompose((prev) => !prev)}>
              {showCompose ? 'Hide composer' : 'Send a note'}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
