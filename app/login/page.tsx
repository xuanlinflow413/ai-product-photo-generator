"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, Check } from "lucide-react";
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
        .catch(() => setMessage("We couldn't complete sign-in. Please try again."));
      return;
    }
    api<{ authenticated: boolean }>("/api/auth/session")
      .then((session) => {
        if (session.authenticated) location.href = "/account/";
        else setMessage("Sign in with Google to manage your EditImages account.");
      })
      .catch(() => setMessage("Sign-in is temporarily unavailable. Please try again."));
  }, []);

  const signInUrl = `${AUTH_URL}?${new URLSearchParams({ returnUrl: "https://editimages.app/login/" })}`;

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-4"
          >
            <Camera className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            <span className="text-lg">EditImages</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-sm text-sm font-medium text-slate-600 outline-none hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-4"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden min-[360px]:inline">Back to home</span>
            <span className="min-[360px]:hidden">Home</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_440px] lg:gap-20 lg:py-16">
        <section className="hidden max-w-xl lg:block" aria-labelledby="sign-in-context">
          <p className="text-sm font-semibold uppercase text-indigo-700">Your product image workspace</p>
          <h2 id="sign-in-context" className="mt-4 text-4xl font-bold leading-tight">
            Pick up your image work where you left off.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
            Sign in to access your EditImages account and its available image editing tools.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-slate-700">
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              One Google sign-in, with no new password to remember
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              Return directly to your EditImages account
            </li>
          </ul>
        </section>

        <section className="mx-auto w-full max-w-[440px] rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-9" aria-labelledby="sign-in-title">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Camera className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 id="sign-in-title" className="mt-6 text-2xl font-bold sm:text-3xl">Sign in to EditImages</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Continue with Google to access your EditImages account.
          </p>
          <a
            href={signInUrl}
            className="mt-7 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <GoogleMark />
            Continue with Google
          </a>
          <p className="mt-5 min-h-5 text-sm leading-5 text-slate-500" role="status" aria-live="polite">
            {message}
          </p>
          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-xs leading-5 text-slate-500">
              You will continue to Google to sign in, then return to EditImages. We never ask for your Google password.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.6 0-4.81-1.76-5.6-4.13H3.05v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.93A6 6 0 0 1 6.08 12c0-.67.12-1.32.32-1.93V7.45H3.05A10 10 0 0 0 2 12c0 1.63.39 3.17 1.05 4.55l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.95 5.45l3.35 2.62c.79-2.37 3-4.13 5.6-4.13Z" />
    </svg>
  );
}
