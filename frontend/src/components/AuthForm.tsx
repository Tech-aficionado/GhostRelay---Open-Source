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
      <div className="bg-slate-800 p-10 rounded-xl border border-slate-700 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">✉</span>
          <h2 className="text-2xl font-bold">
            {isLoginMode ? "Login" : "Sign Up"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-400 mb-1.5"
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
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-400 mb-1.5"
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
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isLoginMode ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-slate-400">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            {isLoginMode ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
