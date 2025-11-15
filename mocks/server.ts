/**
 * MSW server setup for Node.js tests (Jest, Playwright)
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

