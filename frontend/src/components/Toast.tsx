"use client";

interface ToastProps {
  message: string;
  type: "success" | "error";
}

export default function Toast({ message, type }: ToastProps) {
  const borderColor = type === "success" ? "border-green-500" : "border-red-500";

  return (
    <div
      className={`bg-slate-800 border ${borderColor} px-6 py-3.5 rounded-lg text-sm shadow-lg animate-slide-in`}
    >
      {message}
    </div>
  );
}
