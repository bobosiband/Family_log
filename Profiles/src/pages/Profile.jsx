import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
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
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [pictureFile, setPictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pictureStatus, setPictureStatus] = useState({ loading: false, success: "", error: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, success: "", error: "" });
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!pictureFile) return;
    const url = URL.createObjectURL(pictureFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pictureFile]);

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
    setPictureFile(file);
    setPictureStatus({ loading: false, success: "", error: "" });
  };

  const handlePictureUpload = async () => {
    if (!pictureFile || !user) return;
    setPictureStatus({ loading: true, success: "", error: "" });
    const formData = new FormData();
    formData.append("userId", user.id || user._id || user.userId || "");
    formData.append("profileImage", pictureFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/picture`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }
      login(data);
      setPictureFile(null);
      setPictureStatus({ loading: false, success: "Profile picture updated successfully.", error: "" });
    } catch (err) {
      console.error(err);
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile/password/change/${user.id || user._id || user.userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword, currentPassword }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Password update failed");
      }
      setPasswordStatus({ loading: false, success: "Password updated successfully.", error: "" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
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
          <h2>Not signed in yet</h2>
          <p>Log in to manage your profile and keep family memories up to date.</p>
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
                src={previewUrl || user.profilePictureUrl || "https://via.placeholder.com/240x240?text=No+Image"}
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

              <p className={styles.profileBio}>{user.bio || "Share a warm note about the family and what matters most."}</p>

              <div className={styles.heroActions}>
                <button className={styles.primaryButton} onClick={() => navigate("/profile/edit")}>Edit profile</button>
                <button className={styles.secondaryButton} onClick={() => setShowPasswordForm((prev) => !prev)}>
                  {showPasswordForm ? "Hide password" : "Change password"}
                </button>
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
            <h2>Profile actions</h2>
            <p>Manage your account, picture, and security from one place.</p>
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

        {pictureFile && (
          <section className={styles.uploadSection}>
            <div className={styles.uploadPreview}>
              <div className={styles.uploadLabel}>Preview selected image</div>
              <img src={previewUrl} alt="Preview" />
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
                {pictureStatus.loading ? "Uploading…" : "Save picture"}
              </button>
              <button
                type="button"
                className={styles.tertiaryButton}
                onClick={() => {
                  setPictureFile(null);
                  setPreviewUrl(null);
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
              <p>Use a strong password to keep your family story safe.</p>
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
                {passwordStatus.loading ? "Saving…" : "Update password"}
              </button>
            </form>
          </section>
        )}

        <section className={styles.quickSection}>
          <div className={styles.quickCard}>
            <h2>Quick settings</h2>
            <p>Fast access to your profile preferences and privacy controls.</p>
            <div className={styles.shortcutGrid}>
              <button type="button" className={styles.shortcutButton} onClick={() => navigate("/profile/edit")}>Update info</button>
              <button type="button" className={styles.shortcutButton} onClick={() => fileInputRef.current?.click()}>Change photo</button>
              <button type="button" className={styles.shortcutButton} onClick={() => setShowPasswordForm(true)}>Security</button>
            </div>
          </div>
        </section>

        {logoutConfirm && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmDialog}>
              <h3>Confirm logout</h3>
              <p>Are you sure you want to sign out from your family log?</p>
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
