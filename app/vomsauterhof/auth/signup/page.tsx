"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@/types/user";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
    role: UserRole.GUEST,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    if (formData.password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: formData.userName,
          password: formData.password,
          role: formData.role,
          enabled: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registrierung fehlgeschlagen");
        setLoading(false);
        return;
      }

      router.push("/vomsauterhof/auth/login");
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-[22rem]">
        <div className="">
          <h4>Register</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                minLength={3}
                value={formData.userName}
                onChange={(e) =>
                  setFormData({ ...formData, userName: e.target.value })
                }
                className="outline-0  p-1 border border-[var(--c-border)] rounded-[0.5rem] h-[2.5rem] bg-[#F7E4D4] font-p4 pl-2 font-medium w-full"
                placeholder="Mindestens 3 Zeichen"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-[#58483B] mb-2"
              >
                Rolle
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className="outline-0  p-1 border border-[var(--c-border)] rounded-[0.5rem] h-[2.5rem] bg-[#F7E4D4] font-p4 pl-2 font-medium w-full"
              >
                <option value={UserRole.GUEST}>Gast</option>
                <option value={UserRole.ADMIN}>Administrator</option>
              </select>
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
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="outline-0  p-1 border border-[var(--c-border)] rounded-[0.5rem] h-[2.5rem] bg-[#F7E4D4] font-p4 pl-2 font-medium w-full"
                placeholder="Mindestens 6 Zeichen"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#58483B] mb-2"
              >
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="outline-0  p-1 border border-[var(--c-border)] rounded-[0.5rem] h-[2.5rem] bg-[#F7E4D4] font-p4 pl-2 font-medium w-full"
                placeholder="Passwort erneut eingeben"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#000] rounded-[0.5rem] h-[2.5rem] text-white font-medium font-p4 hover:opacity-90 flex items-center justify-center cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registrierung..." : "Konto erstellen"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#58483B]/70">
              Haben Sie bereits ein Konto?{" "}
              <Link
                href="/login"
                className="text-[#58483B] font-medium hover:underline"
              >
                Anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
