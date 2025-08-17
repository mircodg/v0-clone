import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { functions } from "@/inngest/functions";

// Create an API that serves all functions defined in src/app/inngest/functions.ts
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: functions,
});
