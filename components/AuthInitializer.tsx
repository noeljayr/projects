"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";

export function AuthInitializer() {
  const refresh = useAuthStore((state) => state.refresh);

  useEffect(() => {
    // Refresh auth state on mount to sync with cookies
    refresh();
  }, [refresh]);

  return null;
}
