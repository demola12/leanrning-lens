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
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChildren = useCallback(async () => {
    if (!user) {
      setChildrenList([]);
      setActiveProfileId(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/profiles/children?user_id=${user.id}`);
      const data = await res.json();
      setChildrenList(data.children || []);
      if (data.children?.length > 0 && !activeProfileId) {
        const saved = localStorage.getItem("activeProfileId");
        const exists = data.children.find((c: any) => c.id === saved);
        setActiveProfileId(exists ? saved : data.children[0].id);
      } else if (data.children?.length === 0) {
        setActiveProfileId(null);
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

  const activeProfile = childrenList.find((c) => c.id === activeProfileId) || null;

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
