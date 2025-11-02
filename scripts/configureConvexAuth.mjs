import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { spawnSync } from "node:child_process";

const SITE_URL = process.env.SITE_URL || "http://localhost:5173";

const keys = await generateKeyPair("RS256", {
  extractable: true,
});

const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

const jwtPrivateKeySingleLine = privateKey.trimEnd().replace(/\n/g, " ");

const run = (args) => {
  const result = spawnSync("npx", args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run(["convex", "env", "set", "SITE_URL", SITE_URL]);
run(["convex", "env", "set", "JWT_PRIVATE_KEY", "--", jwtPrivateKeySingleLine]);
run(["convex", "env", "set", "JWKS", "--", jwks]);
