/**
 * MSW browser setup for development
 * Worker is exported and started by MSWInit component
 */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

