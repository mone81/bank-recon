import type { Metadata } from "next";
import "./globals.css";
import "./ledgerflow.css";

export const metadata: Metadata = {
  title: "Reconciliation · LedgerFlow",
  description: "Monthly bank reconciliation for Selangor Properties.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
