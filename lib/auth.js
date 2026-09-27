import { createHash, timingSafeEqual } from "node:crypto";

function safeEqual(a, b) {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function isAuthorized(request, { webhookUser, webhookPassword }) {
  const header = request.headers.get("authorization") ?? "";

  if (!header.startsWith("Basic ")) {
    return false;
  }

  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");

  if (!decoded.includes(":")) {
    return false;
  }

  const separator = decoded.indexOf(":");

  const userOk = safeEqual(decoded.slice(0, separator), webhookUser);
  const passwordOk = safeEqual(decoded.slice(separator + 1), webhookPassword);

  return userOk && passwordOk;
}
