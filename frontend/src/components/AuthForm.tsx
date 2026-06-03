"use client";

import { useState } from "react";

interface AuthFormProps {
  onLogin: (email: string) => void;
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password.length >= 8) {
      onLogin(email);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-5">
      <div className="bg-[#12182b] p-10 rounded-xl border border-[#2a3563] w-full max-w-md shadow-[0_0_40px_rgba(124,58,237,0.1)]">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3 animate-float">👻</span>
          <h2 className="text-2xl font-bold text-[#e8eaf6]">
            {isLoginMode ? "Welcome Back" : "Join GhostRelay"}
          </h2>
          <p className="text-sm text-[#8892b0] mt-2">
            {isLoginMode ? "Enter the shadows again" : "Start hiding in the shadows"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#8892b0] mb-1.5"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.real@email.com"
              required
              className="w-full px-4 py-3 bg-[#0a0e1a] border border-[#2a3563] rounded-lg text-[#e8eaf6] text-sm focus:outline-none focus:border-[#7c3aed] focus:shadow-[0_0_10px_rgba(124,58,237,0.2)] transition-all"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[#8892b0] mb-1.5"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-[#0a0e1a] border border-[#2a3563] rounded-lg text-[#e8eaf6] text-sm focus:outline-none focus:border-[#7c3aed] focus:shadow-[0_0_10px_rgba(124,58,237,0.2)] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold py-3 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            {isLoginMode ? "Enter the Shadows" : "Become a Ghost"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-[#8892b0]">
          {isLoginMode ? "Don't have an account? " : "Already haunting? "}
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
          >
            {isLoginMode ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
