"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const refresh = useAuthStore((state) => state.refresh);
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Refresh auth store to load user data from cookie
      refresh();

      router.push("/vomsauterhof");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-[22rem]">
        <div className="">
          <h4>Login</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-[#58483B] mb-2"
              >
                Benutzername
              </label>
              <input
                id="userName"
                type="text"
                required
                value={formData.userName}
                onChange={(e) =>
                  setFormData({ ...formData, userName: e.target.value })
                }
                className="outline-0  p-1 border border-[var(--c-border)] rounded-[0.5rem] h-[2.5rem] bg-[#F7E4D4] font-p4 pl-2 font-medium w-full"
                placeholder="Geben Sie Ihren Benutzernamen ein"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#58483B] mb-2"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="outline-0  p-1 border border-[var(--c-border)] rounded-[0.5rem] h-[2.5rem] bg-[#F7E4D4] font-p4 pl-2 font-medium w-full"
                placeholder="Geben Sie Ihr Passwort ein"
              />
            </div>

            

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#58483B] rounded-[0.5rem] h-[2.5rem] text-white font-medium font-p4 hover:opacity-90 flex items-center justify-center cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Anmelden..." : "Login"}
            </button>

            {error && (
              <div
                style={{
                  fontSize: "calc(var(--p4) * 0.8)",
                }}
                className="border border-red-400 text-red-700 px-4 flex items-center justify-center rounded-[0.5rem] h-[2rem]"
              >
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
