"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  User,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Moon,
  Bell,
  Globe,
  LogOut,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  CreditCard,
  Zap,
  Sparkles,
  Crown,
  Star,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/lib/useSubscription";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  ref_uuid: string;
  role: string;
  created_at: string;
  avatar_url?: string;
  display_name?: string;
  phone?: string;
  date_of_birth?: string;
  country?: string;
  timezone?: string;
  bio?: string;
  subjects?: string[];
  school?: string;
  teaching_experience?: string;
}

const tabs = ["Profile", "Security", "Subscription", "Notifications", "Preferences"] as const;
type Tab = (typeof tabs)[number];

export default function SettingsPage() {
  const { user, role, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [bio, setBio] = useState("");
  const [subjects, setSubjects] = useState("");
  const [school, setSchool] = useState("");
  const [teachingExperience, setTeachingExperience] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    email: true,
    reminders: true,
    weekly: false,
    updates: false,
  });
  const { subscription, loading: subLoading, createCheckoutSession, openPortal, cancelSubscription, resumeSubscription } = useSubscription();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const res = await fetch(`/api/profile?user_id=${user.id}`);
      const data = await res.json();
      if (data.id) {
        setProfile(data);
        setFullName(data.full_name || "");
        setEmail(data.email || "");
        setDisplayName(data.display_name || "");
        setPhone(data.phone || "");
        setDateOfBirth(data.date_of_birth || "");
        setCountry(data.country || "");
        setTimezone(data.timezone || "");
        setBio(data.bio || "");
        setSubjects((data.subjects || []).join(", "));
        setSchool(data.school || "");
        setTeachingExperience(data.teaching_experience || "");
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleProfileSave = async () => {
    if (!user) return;
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess(false);

    const res = await fetch("/api/profile/update-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        full_name: fullName,
        email,
        display_name: displayName,
        phone,
        date_of_birth: dateOfBirth || null,
        country,
        timezone,
        bio,
        subjects: subjects.split(",").map((s) => s.trim()).filter(Boolean),
        school,
        teaching_experience: teachingExperience,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setProfileError(data.error || "Failed to update");
    } else {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }

    setProfileSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPasswordError("");
    setPasswordSuccess(false);

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordSaving(true);
    const res = await fetch("/api/profile/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setPasswordError(data.error || "Failed to change password");
    } else {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    }

    setPasswordSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!user || deleting) return;
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    setDeleting(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile, account, and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 p-1 bg-gray-100 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "Profile" && (
        <div className="space-y-8">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                {profile?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
              </div>
              <button onClick={() => document.getElementById("teacher-avatar-upload")?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
                <Camera className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <input id="teacher-avatar-upload" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                const form = new FormData();
                form.append("file", file);
                form.append("user_id", user.id);
                const res = await fetch("/api/upload", { method: "POST", body: form });
                const data = await res.json();
                if (data.url) {
                  setProfile((prev) => prev ? { ...prev, avatar_url: data.url } : prev);
                  await fetch("/api/profile/update-name", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: user.id, avatar_url: data.url }) });
                }
              }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{profile?.full_name}</h2>
              <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-400">
                <span className="capitalize">{profile?.role}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <code className="text-xs font-mono">{profile?.ref_uuid}</code>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="border border-gray-200 rounded-lg p-6 space-y-5">
            <h3 className="text-sm font-bold text-gray-800">Basic Information</h3>

            {profileError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Profile updated successfully
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold shrink-0 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile?.full_name?.split(" ").map((n) => n[0]).join("") || "?"
                    )}
                  </div>
                  <label className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !user) return;
                      const form = new FormData();
                      form.append("file", file);
                      form.append("user_id", user.id);
                      const res = await fetch("/api/upload", { method: "POST", body: form });
                      const data = await res.json();
                      if (data.url) {
                        setProfile((prev) => prev ? { ...prev, avatar_url: data.url } : prev);
                        await fetch("/api/profile/update-name", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ user_id: user.id, avatar_url: data.url }),
                        });
                      }
                    }} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Name <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} readOnly className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United Kingdom" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time Zone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="">Select timezone</option>
                  {Intl.supportedValuesOf?.("timeZone")?.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 mt-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Teacher Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell students about yourself..." className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subjects</label>
                  <input type="text" value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Math, Science, English (comma separated)" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">School / Organization</label>
                  <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g. Springfield Elementary" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teaching Experience <span className="text-gray-400 font-normal">(optional)</span></label>
                  <select value={teachingExperience} onChange={(e) => setTeachingExperience(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="">Select experience</option>
                    <option value="less_than_1">Less than 1 year</option>
                    <option value="1_to_3">1–3 years</option>
                    <option value="3_to_5">3–5 years</option>
                    <option value="5_to_10">5–10 years</option>
                    <option value="10_plus">10+ years</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <KeyRound className="w-4 h-4 text-gray-400" />
              <div className="text-sm text-gray-500">
                <span className="font-medium">Reference UUID: </span>
                <code className="text-xs font-mono text-gray-600">{profile?.ref_uuid}</code>
                <span className="text-gray-400 ml-1">— Share this with your student to connect</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
              >
                {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {profileSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Account created */}
          <div className="text-xs text-gray-400">
            Account created {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ""}
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === "Security" && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-5">Change Password</h3>

            {passwordError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Password changed successfully
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm new password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
                >
                  {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {passwordSaving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-200 rounded-lg p-6">
            <h3 className="text-sm font-bold text-red-600 mb-1">Danger Zone</h3>
            <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back.</p>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-60"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === "Subscription" && (
        <div className="space-y-6">
          {subLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">Current Plan</h3>
                <div className="flex items-center justify-between p-5 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${subscription?.plan === "unlimited" ? "bg-amber-50" : subscription?.plan === "family" ? "bg-primary/5" : subscription?.plan === "solo" ? "bg-blue-50" : "bg-gray-100"}`}>
                      {subscription?.plan === "unlimited" ? <Crown className="w-5 h-5 text-amber-500" /> :
                       subscription?.plan === "family" ? <Users className="w-5 h-5 text-primary" /> :
                       subscription?.plan === "solo" ? <Star className="w-5 h-5 text-blue-500" /> :
                       <Zap className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 capitalize">{subscription?.plan || "No"} Plan</div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {!subscription?.plan ? "No active plan" :
                         subscription?.plan === "solo" ? "For one student" :
                         subscription?.plan === "family" ? "For up to 3 students" :
                         "Unlimited students"}
                        {subscription?.current_period_end && ` · Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${subscription?.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      {subscription?.status === "active" ? "Active" : subscription?.status || "Active"}
                    </span>
                    {!subscription?.plan && (
                      <button onClick={() => createCheckoutSession("solo")} className="px-4 py-1.5 rounded-md text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Upgrade</button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">Upgrade Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "solo", name: "Solo ⭐", price: "£5.99", period: "/month", desc: "For one student", icon: Star, color: "text-blue-500", features: ["1 student profile", "Unlimited assignments", "AI-powered grading", "Progress tracking", "Multi-teacher support", "PDF export"] },
                    { id: "family", name: "Family", price: "£10.99", period: "/month", desc: "Up to 3 students", icon: Users, color: "text-primary", features: ["Up to 3 student profiles", "Unlimited assignments", "AI-powered grading", "Parent dashboard", "Family management", "Priority support"], popular: true },
                    { id: "unlimited", name: "Unlimited", price: "£20.99", period: "/month", desc: "Unlimited students", icon: Crown, color: "text-amber-500", features: ["Unlimited student profiles", "Everything in Family", "Priority support"] },
                  ].map((plan: any) => {
                    const Icon = plan.icon;
                    const isCurrent = subscription?.plan === plan.id;
                    return (
                      <div key={plan.id} className={`relative rounded-lg border-2 p-6 ${isCurrent ? "border-primary bg-primary/5" : plan.popular ? "border-primary bg-white" : "border-gray-200 bg-white"}`}>
                        {plan.popular && !isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-xs font-semibold">Most Popular</div>}
                        <Icon className={`w-8 h-8 ${plan.color} mb-3`} />
                        <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                        <div className="mt-1 flex items-baseline gap-0.5"><span className="text-2xl font-bold text-gray-900">{plan.price}</span><span className="text-sm text-gray-400">{plan.period}</span></div>
                        <p className="mt-1 text-xs text-gray-400">{plan.desc}</p>
                        <ul className="mt-5 space-y-2.5">{plan.features.map((f: string) => (<li key={f} className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{f}</li>))}</ul>
                        <button disabled={isCurrent} onClick={() => createCheckoutSession(plan.id)}
                          className={`mt-6 w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${isCurrent ? "bg-primary/10 text-primary cursor-default" : plan.popular ? "bg-primary text-white hover:bg-primary-dark" : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"}`}>
                          {isCurrent ? "Current Plan" : "Upgrade"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Billing History & Payment Method</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{subscription?.stripe_customer_id ? "View invoices, update payment method, and manage billing through Stripe." : "No payment method on file."}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {subscription?.stripe_customer_id && (
                      <button onClick={openPortal} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">Manage Billing</button>
                    )}
                  </div>
                </div>
              </div>

              {subscription?.plan && subscription?.status === "active" && (
                <div className="border border-red-200 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div><h3 className="text-sm font-bold text-red-600">Cancel Subscription</h3><p className="text-xs text-gray-500 mt-0.5">Your subscription will remain active until the end of the current billing period.</p></div>
                    <button onClick={cancelSubscription} className="px-4 py-2 rounded-lg bg-white border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all">Cancel Plan</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "Notifications" && (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="space-y-5">
            {[
              { key: "email", label: "Email notifications", desc: "Receive emails about assignment updates and results" },
              { key: "reminders", label: "Assignment reminders", desc: "Get reminded about upcoming and overdue assignments" },
              { key: "weekly", label: "Weekly summary", desc: "Receive a weekly summary of progress and activity" },
              { key: "updates", label: "Product updates", desc: "Get notified about new features and improvements" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-gray-800">{item.label}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${notifications[item.key] ? "bg-primary" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${notifications[item.key] ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "Preferences" && (
        <div className="border border-gray-200 rounded-lg p-6 space-y-5">
          {[
            { label: "Language", value: "English (US)", icon: Globe },
            { label: "Theme", value: "Light", icon: Moon },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-800">{item.label}</span>
                </div>
                <div className="relative">
                  <select className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                    <option>{item.value}</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
