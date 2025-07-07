import "./global.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fidooo ERP",
  description: "ERP - Para todo Argentina",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
