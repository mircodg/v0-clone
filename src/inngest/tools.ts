import { getSandbox } from "@/e2b/utils";
import { createTool } from "@inngest/agent-kit";
import z from "zod";

export const terminal = createTool({
  name: "terminal",
  description: "use terminal to run commands",
  parameters: z.object({
    command: z.string(),
  }),
  handler: async ({ command }, { step, network }) => {
    const sandboxId = network.state.data.sandboxId;
    if (!sandboxId) {
      throw new Error(
        "Sandbox ID not found in network state. Make sure the sandbox is properly initialized."
      );
    }
    return await step?.run("terminal", async () => {
      const buffers = { stdout: "", stderr: "" };
      try {
        const sandbox = await getSandbox(sandboxId);
        await sandbox.commands.run(command, {
          // fill buffers
          onStdout: (data) => {
            buffers.stdout += data;
          },
          onStderr: (data) => {
            buffers.stderr += data;
          },
        });
        return buffers.stdout;
      } catch (error) {
        // log the error
        console.error(
          `Error running command ${command} in sandbox ${sandboxId}: ${error}\nstderr: ${buffers.stderr}\nstdout: ${buffers.stdout}`
        );
        // return the error to the agent so it can retry
        return `Error running command ${command} in sandbox ${sandboxId}: ${error}\nstderr: ${buffers.stderr}\nstdout: ${buffers.stdout}`;
      }
    });
  },
});

export const createOrUpdateFiles = createTool({
  name: "createOrUpdateFiles",
  description: "use this tool to create or update files inside the sandbox",
  parameters: z.object({
    files: z.array(
      z.object({
        path: z.string(),
        content: z.string(),
      })
    ),
  }),
  handler: async ({ files }, { step, network }) => {
    const sandboxId = network.state.data.sandboxId;
    if (!sandboxId) {
      throw new Error(
        "Sandbox ID not found in network state. Make sure the sandbox is properly initialized."
      );
    }
    const newFiles = await step?.run("createOrUpdateFiles", async () => {
      try {
        // keep track of the files that have been updated
        const updatedFiles = network.state.data.files || {};

        // get the sandbox and write/update the files
        const sandbox = await getSandbox(sandboxId);
        for (const file of files) {
          await sandbox.files.write(file.path, file.content);
          updatedFiles[file.path] = file.content;
        }

        // return the updated files
        return updatedFiles;
      } catch (error) {
        // log the error
        console.error(
          `Error creating or updating files in sandbox ${sandboxId}: ${error}`
        );
        // return the error to the agent so it can retry
        return `Error creating or updating files in sandbox ${sandboxId}: ${error}`;
      }
    });

    // update the network state with the new files if it's an object (no errors occurred)
    if (typeof newFiles === "object") {
      network.state.data.files = newFiles;
    }
  },
});

export const readFiles = createTool({
  name: "readFiles",
  description: "read files from the sandbox",
  parameters: z.object({
    files: z.array(z.string()),
  }),
  handler: async ({ files }, { step, network }) => {
    const sandboxId = network.state.data.sandboxId;
    if (!sandboxId) {
      throw new Error(
        "Sandbox ID not found in network state. Make sure the sandbox is properly initialized."
      );
    }
    return await step?.run("readFiles", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);
        const contents = [];
        for (const file of files) {
          const content = await sandbox.files.read(file);
          contents.push({
            path: file,
            content: content,
          });
        }
        // return file contents to the agent
        return JSON.stringify(contents);
      } catch (error) {
        // log the error
        console.error(`Error reading files in sandbox ${sandboxId}: ${error}`);
        // return the error to the agent so it can retry
        return `Error reading files in sandbox ${sandboxId}: ${error}`;
      }
    });
  },
});
