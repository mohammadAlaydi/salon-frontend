/**
 * Central export for all MSW request handlers
 */

import { authHandlers } from "./auth";
import { publicHandlers } from "./public";
import { adminHandlers } from "./admin";

export const handlers = [...authHandlers, ...publicHandlers, ...adminHandlers];

