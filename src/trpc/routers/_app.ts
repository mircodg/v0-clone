import { createTRPCRouter } from "@/trpc/init";
import { messagesRouter } from "@/modules/messages/server/procedures";
import { projectsRouter } from "@/modules/projects/server/procedures";
import { usageRouter } from "@/modules/server/procedure";

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
  usage: usageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
