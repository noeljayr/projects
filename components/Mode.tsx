"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function Mode() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (mode) {
      const checkSession = async () => {
        const checkSession = await fetch("/api/check-session");

        const data = await checkSession.json();

        if (!data.loggedIn) {
          // remove session cookie
          document.cookie =
            "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          // remove user data cookie
          document.cookie =
            "user-data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          // remove all get parameters
          window.location.href =
            window.location.origin + window.location.pathname;
        }
      };

      checkSession();
    }
  }, [mode]);
  return <></>;
}

export default Mode;
