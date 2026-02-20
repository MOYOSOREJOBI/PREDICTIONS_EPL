import "@/app/globals.css";
import Link from "next/link";
import { ReactNode } from "react";

const links = [
  ["/", "Dashboard"],
  ["/fixtures", "Fixtures"],
  ["/picks", "My Picks"],
  ["/model", "Model"],
  ["/data", "Data"],
  ["/about", "About"]
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900">
        <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
          <aside className="hidden border-r bg-white p-6 md:block">
            <div className="mb-8 text-lg font-semibold">EPL Predict</div>
            <nav className="space-y-2">
              {links.map(([href, label]) => (
                <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300">{label}</Link>
              ))}
            </nav>
          </aside>
          <div>
            <header className="sticky top-0 z-10 border-b bg-white/90 px-4 py-3 backdrop-blur md:px-8">
              <nav className="flex gap-3 overflow-auto md:hidden">
                {links.map(([href, label]) => <Link key={href} href={href} className="rounded border px-2 py-1 text-xs">{label}</Link>)}
              </nav>
            </header>
            <main className="p-4 md:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
