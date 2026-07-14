"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const AUTH_URL = "https://auth.editimages.app/api/auth/google";

export default function Login() {
  const [message, setMessage] = useState("Checking your session...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("auth_token");
    if (token) {
      api("/api/auth/exchange", { method: "POST", body: JSON.stringify({ token }) })
        .then(() => {
          history.replaceState(null, "", "/login/");
          location.href = "/account/";
        })
        .catch((error) => setMessage(error instanceof Error ? error.message : "Sign-in failed"));
      return;
    }
    api<{ authenticated: boolean }>("/api/auth/session")
      .then((session) => {
        if (session.authenticated) location.href = "/account/";
        else setMessage("Sign in with Google to manage your EditImages account.");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Account service unavailable"));
  }, []);

  const signInUrl = `${AUTH_URL}?${new URLSearchParams({ returnUrl: "https://editimages.app/login/" })}`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-20">
      <div className="mx-auto max-w-md border bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm text-indigo-600">Home</Link>
        <h1 className="mt-5 text-3xl font-bold">Sign in to EditImages</h1>
        <p className="mt-2 text-sm text-slate-600">Use your Google account. Authentication is handled on the EditImages branded domain.</p>
        <a href={signInUrl} className="mt-6 block w-full bg-indigo-600 p-3 text-center font-semibold text-white">Continue with Google</a>
        <p className="mt-4 text-sm text-slate-500" role="status">{message}</p>
      </div>
    </main>
  );
}
