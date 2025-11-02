import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Mount Convex Auth HTTP endpoints (e.g., /api/auth/* and OAuth callbacks)
auth.addHttpRoutes(http);

export default http;
