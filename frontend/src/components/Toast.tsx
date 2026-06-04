"use client";

interface ToastProps {
  message: string;
  type: "success" | "error";
}

export default function Toast({ message, type }: ToastProps) {
  const styles = type === "success"
    ? "border-[var(--relay-success)]/30 bg-[var(--relay-card)]"
    : "border-[var(--relay-danger)]/30 bg-[var(--relay-card)]";

  const icon = type === "success"
    ? <svg className="w-3.5 h-3.5 text-[var(--relay-success)] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
    : <svg className="w-3.5 h-3.5 text-[var(--relay-danger)] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;

  return (
    <div
      className={`border ${styles} px-4 py-3 rounded-lg text-xs shadow-xl animate-slide-in text-[var(--relay-text)] flex items-center gap-2.5 backdrop-blur-xl`}
    >
      {icon}
      {message}
    </div>
  );
}
