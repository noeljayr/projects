"use client";

import RichTextEditor from "@/components/editor/RichTextEditor";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

function Page() {
  const [information, setInformation] = useState("");
  const [wurfName, setWurfName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const wurfId = params.id as string;

  useEffect(() => {
    if (wurfId) {
      fetchWurf();
    }
  }, [wurfId]);

  const fetchWurf = async () => {
    try {
      // Fetch wurf name
      const wurfResponse = await fetch(`/api/wurf/get?id=${wurfId}`);
      const wurfData = await wurfResponse.json();

      if (!wurfData.success) {
        alert(wurfData.message || "Failed to fetch wurf");
        router.push("/vomsauterhof/content/wurf");
        return;
      }

      setWurfName(wurfData.wurf.name);

      // Fetch welpen data
      const welpenResponse = await fetch(`/api/welpen/get?wurfId=${wurfId}`);
      const welpenData = await welpenResponse.json();

      if (welpenData.success) {
        setInformation(welpenData.welpen.information || "");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data");
      router.push("/vomsauterhof/content/wurf");
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    if (!information.trim()) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/welpen/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wurfId,
          information,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/vomsauterhof/content/wurf");
      } else {
        alert(data.message || "Failed to update welpen");
      }
    } catch (error) {
      console.error("Error updating welpen:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-[65ch] max-[720px]:w-full mx-auto">
        <div className="text-center py-8"></div>
      </div>
    );
  }

  return (
    <div className="w-[65ch] max-[720px]:w-full mx-auto">
      <div className=" flex flex-col self-center w-full gap-4">
        <div className="flex items-center pb-2 border-b border-b-black/10">
          <Link
            href={"/vomsauterhof/content/wurf"}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="py-1 flex items-center px-2 bg-white hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer"
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Link>
          <h5 className="ml-4 font-semibold truncate">Welpen: {wurfName}</h5>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !validate()}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className={`py-1 px-2 bg-[#F38D3B] hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer text-white ml-auto disabled:opacity-50 disabled:pointer-events-none`}
          >
            Speichern
          </button>
        </div>

        <RichTextEditor
          value={information}
          placeholder="Information"
          onChange={setInformation}
          disableImageButton={false}
          style={{
            minHeight: "10rem",
          }}
        />
      </div>
    </div>
  );
}

export default Page;
