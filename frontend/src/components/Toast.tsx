"use client";

interface ToastProps {
  message: string;
  type: "success" | "error";
}

export default function Toast({ message, type }: ToastProps) {
  const borderColor = type === "success" ? "border-[#06d6a0]" : "border-[#f43f5e]";

  return (
    <div
      className={`bg-[#12182b] border ${borderColor} px-6 py-3.5 rounded-lg text-sm shadow-lg animate-slide-in text-[#e8eaf6]`}
    >
      {type === "success" ? "👻 " : "💀 "}{message}
    </div>
  );
}
