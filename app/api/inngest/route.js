import { serve } from "inngest/next";
import { inngest } from "../../../src/inngest/client";
import { helloWorld } from "../../../src/inngest/functions";

// Ensure this route runs in the Node.js runtime
export const runtime = "nodejs";

// Expose Inngest functions via this route
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld],
});

