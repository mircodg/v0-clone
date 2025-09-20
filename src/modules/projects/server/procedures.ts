import prisma from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { inngest } from "@/inngest/client";
import { generateSlug } from "random-word-slugs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";

export const projectsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Project ID is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.id, userId: ctx.auth.userId },
      });
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      return project;
    }),

  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      where: {
        userId: ctx.auth.userId,
      },
    });
    return projects;
  }),

  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, "Value is required")
          .max(10000, "Value is too long"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await consumeCredits();
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Something went wrong",
          });
        } else {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "You have used all your credits",
          });
        }
      }

      const newProject = await prisma.project.create({
        data: {
          name: generateSlug(2, { format: "kebab" }),
          userId: ctx.auth.userId,
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      // trigger inngest function. TODO: change this to real inngest function
      await inngest.send({
        name: "code/generate",
        data: {
          text: input.value,
          projectId: newProject.id,
        },
      });

      // return the new project
      return newProject;
    }),
});
