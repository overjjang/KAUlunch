import { crawlMenu } from "../../src/crawler.js";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const restaurants = new Set(["10", "20"]);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const date = url.searchParams.get("date");
  const restaurant = url.searchParams.get("restaurant") || "10";

  if (!datePattern.test(date || "")) return json({ error: "invalid date" }, 400);
  if (!restaurants.has(restaurant)) return json({ error: "invalid restaurant" }, 400);

  try {
    const menus = await crawlMenu(date, restaurant, fetch);
    return json({ date, restaurant, menus, source: "crawler" });
  } catch (error) {
    console.error("menu crawl failed", { date, restaurant, error });
    return json({ error: "menu unavailable" }, 502);
  }
}
