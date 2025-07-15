// lib/defender.js

const DEFENDER_API_URL = process.env.DEFENDER_API_URL;

if (!DEFENDER_API_URL) {
  throw new Error(
    "Missing DEFENDER_API_URL environment variable. " +
    "Please set it in your .env.local or Vercel dashboard."
  );
}

/**
 * Calls the Defender API to detect bot/proxy/VPN traffic.
 *
 * @param {Object} params
 * @param {string} params.ip        - The client's IP address.
 * @param {string} params.userAgent - The client's User‑Agent string.
 * @returns {Promise<Object>}       - An object with boolean flags:
 *    {
 *      isBotUserAgent: boolean,
 *      isScraperISP: boolean,
 *      isIPAbuser: boolean,
 *      isSuspiciousTraffic: boolean,
 *      isDataCenterASN: boolean
 *    }
 * @throws {Error} If the API call fails or returns a non‑2xx status.
 */
export async function detectBot({ ip, userAgent }) {
  const res = await fetch(DEFENDER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ip,
      user_agent: userAgent,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Defender API error: ${res.status} ${res.statusText}` +
      (text ? ` — ${text}` : "")
    );
  }

  const json = await res.json();
  const details = json.details || {};

  return {
    isBotUserAgent:     Boolean(details.isBotUserAgent),
    isScraperISP:       Boolean(details.isScraperISP),
    isIPAbuser:         Boolean(details.isIPAbuser),
    isSuspiciousTraffic: Boolean(details.isSuspiciousTraffic),
    isDataCenterASN:    Boolean(details.isDataCenterASN),
  };
}
