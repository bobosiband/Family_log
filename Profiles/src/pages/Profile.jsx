import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../AuthContext";
import { api } from "../lib/api";
import styles from "./style/Profile.module.css";

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

const calculateCompletion = (user) => {
  if (!user) return 0;
  const fields = ["name", "surname", "username", "email", "bio", "profilePictureUrl"];
  const filled = fields.reduce((count, field) => {
    const value = user[field];
    if (!value) return count;
    return count + (typeof value === "string" ? Boolean(value.trim()) : 1);
  }, 0);
  return Math.round((filled / fields.length) * 100);
};

const passwordStrengthLabel = (password) => {
  if (!password) return "Enter a secure password";
  const points = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].reduce(
    (sum, rx) => (rx.test(password) ? sum + 1 : sum),
    0
  );
  if (password.length >= 12 && points >= 3) return "Strong password";
  if (password.length >= 10 && points >= 2) return "Good password";
  if (password.length >= 8) return "Fair password";
  return "Password needs more strength";
};

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [picture, setPicture] = useState({ file: null, url: null });
  const [pictureStatus, setPictureStatus] = useState({ loading: false, success: "", error: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, success: "", error: "" });
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => { if (picture.url) URL.revokeObjectURL(picture.url); };
  }, [picture.url]);

  const completion = useMemo(() => calculateCompletion(user), [user]);
  const accountStatus = user?.status || "Active";
  const joinedDate = formatDate(user?.createdAt || user?.joinedAt || user?.created);
  const updatedDate = formatDate(user?.updatedAt || user?.lastUpdated || user?.modifiedAt);

  const handlePictureSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPictureStatus({ loading: false, success: "", error: "Please choose a valid image file." });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setPictureStatus({ loading: false, success: "", error: "Image must be smaller than 4MB." });
      return;
    }
    const url = URL.createObjectURL(file);
    setPicture({ file, url });
    setPictureStatus({ loading: false, success: "", error: "" });
  };

  const handlePictureUpload = async () => {
    if (!picture.file || !user) return;
    setPictureStatus({ loading: true, success: "", error: "" });
    const formData = new FormData();
    formData.append("profileImage", picture.file);

    try {
      const data = await api.post("/profile/picture", formData);
      refreshUser(data);
      setPicture({ file: null, url: null });
      setPictureStatus({ loading: false, success: "Profile picture updated.", error: "" });
    } catch (err) {
      setPictureStatus({ loading: false, success: "", error: err.message || "Unable to upload image." });
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ loading: false, success: "", error: "Fill in all password fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ loading: false, success: "", error: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ loading: false, success: "", error: "New password must be at least 8 characters." });
      return;
    }

    setPasswordStatus({ loading: true, success: "", error: "" });

    try {
      const userId = user.id || user._id || user.userId;
      await api.post(`/profile/password/change/${userId}`, { newPassword, currentPassword });
      setPasswordStatus({ loading: false, success: "Password updated.", error: "" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordStatus({ loading: false, success: "", error: err.message || "Unable to update password." });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <main className={styles.page}>
        <div className={styles.emptyState}>
          <h2>Not signed in</h2>
          <button className={styles.primaryButton} onClick={() => navigate("/login")}>Sign in</button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <section className={styles.heroSection}>
          <div className={styles.profileCard}>
            <div className={styles.avatarWrapper}>
              <img
                src={picture.url || user.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.name || user.username || 'U'))}&background=c084fc&color=fff&size=240`}
                alt={user.username}
                className={styles.avatar}
              />
              <button
                type="button"
                className={styles.avatarEdit}
                onClick={() => fileInputRef.current?.click()}
              >
                Change picture
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handlePictureSelect}
              />
            </div>

            <div className={styles.profileIntro}>
              <div>
                <p className={styles.profileStatus}>{accountStatus}</p>
                <h1>{`${user.name || "Family"} ${user.surname || "Member"}`}</h1>
                <p className={styles.username}>@{user.username}</p>
              </div>

              <p className={styles.profileBio}>{user.bio || "No bio yet."}</p>

              <div className={styles.heroActions}>
                <motion.button
                  className={styles.primaryButton}
                  onClick={() => navigate("/profile/edit")}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  Edit profile
                </motion.button>
                <motion.button
                  className={styles.secondaryButton}
                  onClick={() => setShowPasswordForm((prev) => !prev)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  {showPasswordForm ? "Hide password form" : "Change password"}
                </motion.button>
              </div>

              <div className={styles.completionRow}>
                <span>Profile completion</span>
                <strong>{completion}%</strong>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h2>Profile overview</h2>
            <div className={styles.infoRow}>
              <span>Full name</span>
              <p>{`${user.name || "-"} ${user.surname || ""}`.trim()}</p>
            </div>
            <div className={styles.infoRow}>
              <span>Email</span>
              <p>{user.email || "-"}</p>
            </div>
            <div className={styles.infoRow}>
              <span>Username</span>
              <p>@{user.username}</p>
            </div>
            <div className={styles.infoRow}>
              <span>Member since</span>
              <p>{joinedDate}</p>
            </div>
            <div className={styles.infoRow}>
              <span>Last updated</span>
              <p>{updatedDate}</p>
            </div>
          </div>

          <div className={styles.actionCard}>
            <h2>Account actions</h2>
            <div className={styles.actionButtons}>
              <button type="button" className={styles.secondaryButton} onClick={() => navigate("/profile/edit")}>Edit profile</button>
              <button type="button" className={styles.secondaryButton} onClick={() => fileInputRef.current?.click()}>Upload photo</button>
              <button type="button" className={styles.secondaryButton} onClick={() => setShowPasswordForm((prev) => !prev)}>
                Change password
              </button>
              <button type="button" className={styles.dangerButton} onClick={() => setLogoutConfirm(true)}>
                Logout
              </button>
            </div>
          </div>
        </section>

        {picture.file && (
          <section className={styles.uploadSection}>
            <div className={styles.uploadPreview}>
              <div className={styles.uploadLabel}>Preview</div>
              <img src={picture.url} alt="Preview" />
            </div>
            <div className={styles.uploadControls}>
              {pictureStatus.error && <p className={styles.errorText}>{pictureStatus.error}</p>}
              {pictureStatus.success && <p className={styles.successText}>{pictureStatus.success}</p>}
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handlePictureUpload}
                disabled={pictureStatus.loading}
              >
                {pictureStatus.loading ? "Uploading..." : "Save picture"}
              </button>
              <button
                type="button"
                className={styles.tertiaryButton}
                onClick={() => {
                  setPicture({ file: null, url: null });
                  setPictureStatus({ loading: false, success: "", error: "" });
                }}
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {showPasswordForm && (
          <section className={styles.passwordSection}>
            <div className={styles.passwordHeader}>
              <h2>Change password</h2>
            </div>
            <form className={styles.passwordForm} onSubmit={handlePasswordSubmit}>
              <label>
                Current password
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Create a new password"
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                />
              </label>
              <div className={styles.passwordHint}>
                <span>{passwordStrengthLabel(passwordForm.newPassword)}</span>
              </div>
              {passwordStatus.error && <p className={styles.errorText}>{passwordStatus.error}</p>}
              {passwordStatus.success && <p className={styles.successText}>{passwordStatus.success}</p>}
              <button type="submit" className={styles.primaryButton} disabled={passwordStatus.loading}>
                {passwordStatus.loading ? "Saving..." : "Update password"}
              </button>
            </form>
          </section>
        )}

        {logoutConfirm && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmDialog}>
              <h3>Confirm logout</h3>
              <p>Are you sure you want to sign out?</p>
              <div className={styles.confirmActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setLogoutConfirm(false)}>Cancel</button>
                <button type="button" className={styles.dangerButton} onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
