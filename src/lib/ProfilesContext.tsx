"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";

export interface ChildProfile {
  id: string;
  full_name: string;
  ref_uuid: string;
  email: string;
  created_at: string;
}

interface ProfilesContextValue {
  children: ChildProfile[];
  activeProfileId: string | null;
  activeProfile: ChildProfile | null;
  setActiveProfileId: (id: string) => void;
  loading: boolean;
  addChild: (fullName: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ProfilesContext = createContext<ProfilesContextValue>({
  children: [],
  activeProfileId: null,
  activeProfile: null,
  setActiveProfileId: () => {},
  loading: true,
  addChild: async () => {},
  refresh: async () => {},
});

export function ProfilesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [ownProfile, setOwnProfile] = useState<ChildProfile | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChildren = useCallback(async () => {
    if (!user) {
      setChildrenList([]);
      setOwnProfile(null);
      setActiveProfileId(null);
      setLoading(false);
      return;
    }
    try {
      const [childrenRes, profileRes] = await Promise.all([
        fetch(`/api/profiles/children?user_id=${user.id}`),
        fetch(`/api/profile?user_id=${user.id}`),
      ]);
      const childrenData = await childrenRes.json();
      const profileData = await profileRes.json();

      const childProfiles = childrenData.children || [];
      setChildrenList(childProfiles);

      // If user has a profile, use it as own profile
      if (profileData?.id) {
        const own: ChildProfile = {
          id: profileData.id,
          full_name: profileData.full_name,
          ref_uuid: profileData.ref_uuid,
          email: profileData.email || "",
          created_at: profileData.created_at,
        };
        setOwnProfile(own);
      }

      if (childProfiles.length > 0 && !activeProfileId) {
        // User is a parent managing children
        const saved = localStorage.getItem("activeProfileId");
        const exists = childProfiles.find((c: any) => c.id === saved);
        setActiveProfileId(exists ? saved : childProfiles[0].id);
      } else if (childProfiles.length === 0 && ownProfile && !activeProfileId) {
        // User is their own profile (not a parent)
        setActiveProfileId(ownProfile.id);
      }
    } catch {
      setChildrenList([]);
    } finally {
      setLoading(false);
    }
  }, [user, activeProfileId]);

  useEffect(() => {
    fetchChildren();
  }, [user]);

  useEffect(() => {
    if (activeProfileId) {
      localStorage.setItem("activeProfileId", activeProfileId);
    }
  }, [activeProfileId]);

  // If user has no children, use own profile as active
  const activeProfile = childrenList.find((c) => c.id === activeProfileId) ||
    (childrenList.length === 0 && ownProfile?.id === activeProfileId ? ownProfile : null) ||
    (childrenList.length === 0 ? ownProfile : null);

  const addChild = async (fullName: string) => {
    if (!user) return null;
    const res = await fetch("/api/profiles/add-child", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, full_name: fullName }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to add child");
    }
    await fetchChildren();
    return data;
  };

  return (
    <ProfilesContext.Provider
      value={{
        children: childrenList,
        activeProfileId,
        activeProfile,
        setActiveProfileId,
        loading,
        addChild,
        refresh: fetchChildren,
      }}
    >
      {children}
    </ProfilesContext.Provider>
  );
}

export const useProfiles = () => useContext(ProfilesContext);
