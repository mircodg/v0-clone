import prisma from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { inngest } from "@/inngest/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const messagesRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid("Project ID is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.auth.userId,
          },
        },
        include: {
          fragments: true,
        },
        orderBy: {
          updatedAt: "asc",
        },
      });
      return messages;
    }),
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, "Value is required")
          .max(10000, "Value is too long"),
        projectId: z.string().uuid("Project ID is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId, userId: ctx.auth.userId },
      });
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      const newMessage = await prisma.message.create({
        data: {
          content: input.value,
          role: "USER",
          type: "RESULT",
          projectId: project.id,
        },
      });

      // trigger inngest function. TODO: change this to real inngest function
      await inngest.send({
        name: "code/generate",
        data: {
          text: input.value,
          projectId: input.projectId,
        },
      });

      // return the new message
      return newMessage;
    }),
});
