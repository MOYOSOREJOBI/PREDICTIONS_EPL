import "@/app/globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white">
        <Sidebar />
        <Topbar />
        <main className="ml-64 max-h-screen overflow-auto pt-16">
          <div className="p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
