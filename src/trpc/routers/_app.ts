import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { inngest } from "@/inngest/client";

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
  invoke: baseProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .mutation(async (opts) => {
      await inngest.send({
        name: "test/hello.world",
        data: {
          email: opts.input.email,
        },
      });
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
