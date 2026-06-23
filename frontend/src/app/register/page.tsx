"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      router.replace("/dashboard");
    } else {
      // Dashboard handles registration via AuthForm
      router.replace("/dashboard?mode=register");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
