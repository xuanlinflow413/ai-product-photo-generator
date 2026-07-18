import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | EditImages",
  description: "Manage EditImages credits and subscription.",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
