import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { api, apiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import "./Profile.css";

export function Profile() {
  const { user, refresh } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name ?? "");
    setPhone(user?.phone ?? "");
  }, [user]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");
    setSavingProfile(true);
    try {
      await api.patch("/auth/profile", { full_name: fullName.trim(), phone: phone.trim() || null });
      await refresh();
      setProfileMessage("Personal details updated successfully.");
    } catch (error) {
      setProfileError(apiError(error, "Could not update personal details."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password changed successfully.");
    } catch (error) {
      setPasswordError(apiError(error, "Could not change password."));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="profile-page workspace-page">
      <section className="workspace-hero profile-page__hero">
        <div>
          <p className="workspace-hero__eyebrow">Account Center</p>
          <h1>Your profile</h1>
          <p className="muted">Manage your personal details and account security.</p>
        </div>
        <div className="profile-page__status"><ShieldCheck size={17} /> Account active</div>
      </section>

      <div className="profile-page__grid">
        <section className="card workspace-panel profile-card">
          <div className="profile-card__heading">
            <div className="profile-card__icon"><UserRound size={20} /></div>
            <div>
              <p className="workspace-hero__eyebrow">Personal details</p>
              <h2>Profile information</h2>
            </div>
          </div>
          <form className="profile-form" onSubmit={saveProfile}>
            <label>
              Full name
              <input className="input" value={fullName} required minLength={2} maxLength={120} onChange={(event) => setFullName(event.target.value)} />
            </label>
            <label>
              Phone number
              <input className="input" type="tel" value={phone} maxLength={40} placeholder="Add your phone number" onChange={(event) => setPhone(event.target.value)} />
            </label>
            <label>
              Email address
              <input className="input profile-form__readonly" type="email" value={user?.email ?? ""} readOnly />
            </label>
            {profileError && <p className="error">{profileError}</p>}
            {profileMessage && <p className="profile-success"><CheckCircle2 size={16} /> {profileMessage}</p>}
            <button className="btn" type="submit" disabled={savingProfile}><Save size={16} /> {savingProfile ? "Saving..." : "Save personal details"}</button>
          </form>
        </section>

        <section className="card workspace-panel profile-card">
          <div className="profile-card__heading">
            <div className="profile-card__icon"><KeyRound size={20} /></div>
            <div>
              <p className="workspace-hero__eyebrow">Account security</p>
              <h2>Change password</h2>
            </div>
          </div>
          <form className="profile-form" onSubmit={changePassword}>
            <label>
              Current password
              <input className="input" type="password" required minLength={8} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
            </label>
            <label>
              New password
              <input className="input" type="password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </label>
            <label>
              Confirm new password
              <input className="input" type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </label>
            <p className="muted profile-form__hint">Use at least 8 characters and keep your password private.</p>
            {passwordError && <p className="error">{passwordError}</p>}
            {passwordMessage && <p className="profile-success"><CheckCircle2 size={16} /> {passwordMessage}</p>}
            <button className="btn btn-ghost" type="submit" disabled={savingPassword}><KeyRound size={16} /> {savingPassword ? "Updating..." : "Change password"}</button>
          </form>
        </section>
      </div>

      <section className="profile-page__account card workspace-panel">
        <div><span className="profile-page__account-label">Member since</span><strong>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</strong></div>
        <div><span className="profile-page__account-label">Referral code</span><strong>{user?.referral_code ?? "-"}</strong></div>
        <div><span className="profile-page__account-label">Verification</span><strong>Manage in KYC verification</strong></div>
      </section>
    </div>
  );
}
