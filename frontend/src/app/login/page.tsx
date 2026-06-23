"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // If already logged in, go to dashboard
    const user = getStoredUser();
    if (user) {
      router.replace("/dashboard");
    } else {
      // Dashboard will show AuthForm when not logged in
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
