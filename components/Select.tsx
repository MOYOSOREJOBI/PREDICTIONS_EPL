import { SelectHTMLAttributes } from "react";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" {...props} />;
}
