import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx("rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm text-white", className)} {...props} />;
}
