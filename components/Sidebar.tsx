import Link from "next/link";
import { BarChart3, Calendar, Database, HelpCircle, History, Home, Target, Users } from "lucide-react";

const items = [
  ["/", "Dashboard", Home],
  ["/predict", "Predict", Target],
  ["/history", "History", History],
  ["/teams", "Teams", Users],
  ["/fixtures", "Fixtures", Calendar],
  ["/model", "Model", BarChart3],
  ["/data", "Data", Database],
  ["/about", "About", HelpCircle]
] as const;

export function Sidebar() {
  return <aside className="fixed left-0 top-0 h-screen w-64 border-r border-zinc-200 bg-white p-6"><h1 className="mb-6 text-lg font-semibold text-zinc-900">EPL Predictor</h1><nav className="space-y-1">{items.map(([href, label, Icon]) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"><Icon size={18} strokeWidth={1.5} />{label}</Link>)}</nav></aside>;
}
