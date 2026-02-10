import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hong-hot-moi-ngay",
  description: "Video hong-hot-moi-ngay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        {children}
      </body>
    </html>
  );
}
