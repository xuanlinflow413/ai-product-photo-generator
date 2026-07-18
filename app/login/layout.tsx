import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | EditImages",
  description: "Sign in to manage EditImages credits and cloud edits.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
