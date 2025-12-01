"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    authClient
      .signOut()
      .then(() => {
        router.push("/login");
      })
      .catch((err) => {
        console.error("Logout failed:", err);
        alert("An error occurred during sign out");
      });
  }, [router]);
}
