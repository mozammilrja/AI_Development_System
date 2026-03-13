import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Dev System",
  description: "Multi-agent AI development dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
