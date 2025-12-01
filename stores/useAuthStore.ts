import { create } from "zustand";
import { deleteCookie, getCookie } from "cookies-next";

export interface User {
  userName: string;
  role: string;
  enabled: boolean;
}

interface AuthState extends User {
  refresh: () => void;
  logout: () => void;
}

const getUserFromCookie = (): User => {
  if (typeof window === "undefined") {
    return { userName: "", role: "", enabled: false };
  }

  const userDataCookie = getCookie("user-data")?.toString();
  if (!userDataCookie) {
    return { userName: "", role: "", enabled: false };
  }

  try {
    const userData = JSON.parse(userDataCookie);
    return {
      userName: userData.userName || "",
      role: userData.role || "",
      enabled: userData.enabled || false,
    };
  } catch {
    return { userName: "", role: "", enabled: false };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getUserFromCookie(),

  // re-read the user data cookie
  refresh: () => {
    const userData = getUserFromCookie();
    set(userData);
  },

  // wipe cookies and reset state
  logout: () => {
    // Remove cookies
    deleteCookie("session");
    deleteCookie("user-data");

    // Reset state to initial empty values
    set({
      userName: "",
      role: "",
      enabled: false,
    });
  },
}));
