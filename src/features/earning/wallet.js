import { auth } from "../auth/firebase-client.js";

async function request(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error || "Wallet request failed.");
  return data;
}

export const loadWallet = () => request("/api/wallet");

export const requestPayout = (amount, method = "manual") =>
  request("/api/wallet/payout-request", {
    method: "POST",
    body: JSON.stringify({
      amount: Number(amount),
      method,
    }),
  });
