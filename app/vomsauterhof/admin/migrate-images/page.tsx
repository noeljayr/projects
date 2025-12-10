"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export default function MigrateImagesPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const runMigration = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/migrate-images", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setResult("Migration completed successfully!");
      } else {
        setResult(`Migration failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error running migration:", error);
      setResult("Migration failed: Network error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-[65ch] max-[720px]:w-full mx-auto">
      <div className="flex flex-col self-center w-full gap-4">
        <div className="flex items-center pb-2 border-b border-b-black/10">
          <Link
            href="/vomsauterhof/content"
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="py-1 flex items-center px-2 bg-[#FBF2EA] hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer"
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Link>
          <h5 className="ml-4 font-semibold">Bilder Migration</h5>
        </div>

        <div className="bg-[#F9ECE1] border border-[var(--c-border)] rounded-[0.5rem] p-4">
          <h6 className="font-semibold mb-2">Base64 zu Datenbank Migration</h6>
          <p className="text-sm opacity-75 mb-4">
            Diese Migration konvertiert alle Base64-kodierten Bilder in Welpen-
            und Timeline-Einträgen zu Datenbank-URLs. Dies verbessert die
            Performance und reduziert die Datenbankgröße.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={runMigration}
              disabled={isRunning}
              style={{
                transition: "ease 0.5s",
                fontSize: "calc(var(--p4) * 0.9)",
              }}
              className="py-2 px-4 bg-[#F38D3B] hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer text-white disabled:opacity-50 disabled:pointer-events-none"
            >
              {isRunning ? "Migration läuft..." : "Migration starten"}
            </button>

            {isRunning && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F38D3B]"></div>
                <span className="text-sm opacity-75">
                  Migration wird ausgeführt, bitte warten...
                </span>
              </div>
            )}

            {result && (
              <div
                className={`p-3 rounded-[0.35rem] text-sm ${
                  result.includes("successfully")
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {result}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#FBF2EA] border border-[var(--c-border)] rounded-[0.5rem] p-4">
          <h6 className="font-semibold mb-2">
            Was passiert bei der Migration?
          </h6>
          <ul className="text-sm opacity-75 space-y-1">
            <li>
              • Alle Base64-Bilder in Welpen-Einträgen werden zu Datenbank-URLs
              konvertiert
            </li>
            <li>
              • Alle Base64-Bilder in Timeline-Einträgen werden zu
              Datenbank-URLs konvertiert
            </li>
            <li>
              • Alle Base64-Cover-Bilder in Wurf-Einträgen werden zu
              Datenbank-URLs konvertiert
            </li>
            <li>
              • Originale Base64-Daten werden durch Datenbank-URLs ersetzt
            </li>
            <li>• Bilder werden in GridFS mit Metadaten gespeichert</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
