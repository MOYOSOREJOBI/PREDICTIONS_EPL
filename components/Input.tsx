import { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" {...props} />;
}
