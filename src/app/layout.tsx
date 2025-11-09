import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transpayra - Salary Transparency Platform",
  description: "The new era of fair pay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}