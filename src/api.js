const API_URL = "https://script.google.com/macros/s/AKfycbzxdbmPziRrOhCCCrujkG7eFkxEMZLiEQkUAxezcTitJ5IejbhvyKGS4U37agte4XQDBw/exec";

export async function api(action, payload = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  return data;
}
