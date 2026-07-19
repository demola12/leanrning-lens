"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useProfiles } from "@/lib/ProfilesContext";
import { motion } from "framer-motion";
import {
  Library,
  Upload,
  FileText,
  Image,
  File,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  ExternalLink,
  Eye,
} from "lucide-react";

interface LibraryItem {
  id: string;
  student_profile_id: string;
  teacher_id: string | null;
  file_url: string;
  file_type: string;
  file_name: string;
  description: string;
  viewed: boolean;
  viewed_at: string | null;
  created_at: string;
}

export default function StudentLibraryPage() {
  const { user } = useAuth();
  const { activeProfile, children } = useProfiles();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const isParent = children.length > 0;
  const profileId = activeProfile?.id;

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    const fetchItems = async () => {
      const res = await fetch(`/api/student/library/list?profile_id=${profileId}`);
      const data = await res.json();
      if (data.items) setItems(data.items);
      setLoading(false);
    };
    fetchItems();
  }, [profileId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileId) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    const form = new FormData();
    form.append("file", file);
    form.append("profile_id", profileId);
    form.append("description", description);

    const res = await fetch("/api/student/library", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setUploadError(data.error || "Upload failed");
      return;
    }

    setUploadSuccess(true);
    setDescription("");
    setItems((prev) => [data.item, ...prev]);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const fileIcon = (type: string) => {
    if (type === "image") return <Image className="w-5 h-5 text-blue-500" />;
    if (type === "pdf") return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  if (!profileId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="py-24 text-center">
          <Library className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Select a profile</h2>
          <p className="text-sm text-gray-400">Choose a child profile from the sidebar to view their library.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Library</h1>
          <p className="mt-1 text-gray-500">Upload extracurricular work, images, or PDFs for your teacher to view.</p>
          {activeProfile && (
            <p className="text-xs text-gray-400 mt-1 font-mono">{activeProfile.full_name}</p>
          )}
        </div>
      </div>

      {/* Upload Card */}
      <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm mb-8">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Upload New Item</h3>
        <div className="space-y-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (e.g., Science fair project, Art work, Sports certificate)"
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading..." : "Choose File & Upload"}
              <input type="file" accept="image/*,application/pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
            <span className="text-xs text-gray-400">Supports images and PDFs</span>
          </div>
          {uploadError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />Uploaded successfully!
            </div>
          )}
        </div>
      </div>

      {/* Library Items */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center border border-gray-100 rounded-xl bg-white">
          <Library className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No items yet</h3>
          <p className="text-sm text-gray-400">Upload images or PDFs to share with your teacher.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {fileIcon(item.file_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">{item.file_name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                    {item.viewed && <span className="ml-2 text-emerald-500">· Viewed</span>}
                  </p>
                </div>
              </div>
              {item.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
              )}
              <div className="flex items-center gap-2">
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  item.file_type === "image" ? "bg-blue-50 text-blue-600" :
                  item.file_type === "pdf" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"
                }`}>
                  {item.file_type.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
