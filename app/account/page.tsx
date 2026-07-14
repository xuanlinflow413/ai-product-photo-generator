"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Session = {
  authenticated: boolean;
  user: { email: string; name: string | null } | null;
  credits: { balance: number } | null;
  subscription: { status: string; plan_id: string } | null;
  purchases: Array<{ plan_id: string; status: string; purchased_at: number }>;
};

type Plan = { id: string; name: string; price_cents: number; billing_interval: string | null };

export default function Account() {
  const [session, setSession] = useState<Session | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api<Session>("/api/auth/session"), api<{ plans: Plan[] }>("/api/plans")])
      .then(([nextSession, result]) => {
        if (!nextSession.authenticated) {
          location.href = "/login/";
          return;
        }
        setSession(nextSession);
        setPlans(result.plans);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Account service unavailable"));
  }, []);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    location.href = "/login/";
  }

  async function checkout(planId: string) {
    try {
      const result = await api<{ url: string }>("/api/checkout", { method: "POST", body: JSON.stringify({ plan_id: planId }) });
      window.location.assign(result.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Checkout unavailable");
    }
  }

  if (error) return <main className="p-12"><h1 className="text-2xl font-bold">Account unavailable</h1><p className="mt-3">{error}</p><Link className="mt-5 inline-block text-indigo-600" href="/">Home</Link></main>;
  if (!session) return <main className="p-12">Loading account...</main>;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Account</h1><button onClick={logout} className="text-sm text-indigo-600">Sign out</button></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card label="Email" value={session.user?.email || "-"} />
          <Card label="Plan" value={session.subscription?.plan_id || "Free"} />
          <Card label="Credits" value={String(session.credits?.balance ?? 0)} />
        </div>
        <section className="mt-8 border-y border-slate-200 py-6">
          <h2 className="text-xl font-semibold">Billing</h2>
          {plans.length === 0 ? <p className="mt-2 text-sm text-slate-600">Paid plans are not available for EditImages yet. Local marketplace exports remain free.</p> : plans.map((plan) => (
            <div key={plan.id} className="mt-4 flex items-center justify-between border-t pt-4">
              <p><strong>{plan.name}</strong> ${(plan.price_cents / 100).toFixed(2)}{plan.billing_interval ? ` / ${plan.billing_interval}` : ""}</p>
              <button onClick={() => checkout(plan.id)} className="bg-indigo-600 px-4 py-2 font-semibold text-white">Checkout</button>
            </div>
          ))}
        </section>
        <List title="Purchases" empty={!session.purchases.length}>{session.purchases.map((purchase) => <p key={`${purchase.plan_id}-${purchase.purchased_at}`}>{purchase.plan_id} · {purchase.status}</p>)}</List>
        <Link href="/marketplace-image-fixer/" className="mt-8 inline-block bg-indigo-600 px-5 py-3 text-white">Open image fixer</Link>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return <div className="border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 font-semibold">{value}</p></div>;
}

function List({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return <section className="mt-8 border bg-white p-6"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-3 text-sm text-slate-600">{empty ? "No records yet." : children}</div></section>;
}
