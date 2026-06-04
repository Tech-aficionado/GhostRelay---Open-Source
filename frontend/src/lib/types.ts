export interface Alias {
  id: string;
  address: string;
  label: string;
  notes: string;
  category: string;
  active: boolean;
  forwarded: number;
  createdAt: string;
  expiresAt?: string | null;
  maxEmails?: number | null;
  isTemporary?: boolean;
}

export interface User {
  id: string;
  email: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error";
}
