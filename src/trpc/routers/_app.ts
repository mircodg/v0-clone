import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.name}`,
      };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
