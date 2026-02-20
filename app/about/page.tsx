import { Card } from "@/components/Card";

export default function AboutPage() {
  return <Card><h2 className="mb-4 text-lg font-semibold">About</h2><p className="text-sm text-zinc-600">This project predicts EPL outcomes using a pre-match leakage-free feature set and AdaBoost SAMME.R inference in TypeScript.</p></Card>;
}
