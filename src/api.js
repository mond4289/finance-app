const API_URL = "https://script.google.com/macros/s/AKfycbzxdbmPziRrOhCCCrujkG7eFkxEMZLiEQkUAxezcTitJ5IejbhvyKGS4U37agte4XQDBw/exec";

export async function api(action, payload = {}) {
  // ✅ ถ้ามี password ให้ force เป็น string เสมอ
  if (payload.password !== undefined) {
    payload.password = String(payload.password);
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  return data;
}