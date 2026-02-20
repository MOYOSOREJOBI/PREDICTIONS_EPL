import { z } from "zod";

export const predictSchema = z.object({
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1)
}).refine((v) => v.homeTeam !== v.awayTeam, {
  message: "Home and away teams must be different.",
  path: ["awayTeam"]
});
