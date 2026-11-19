const SOURCE_URL = "https://kid.kau.ac.kr/menu_weekly_sub.asp";

const cleanText = (value) =>
  value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();

export const sourceUrlFor = (date, restaurant = "10") =>
  `${SOURCE_URL}?value1=${date}&value3=k&value2=${encodeURIComponent(restaurant)}`;

export const parseMenuHtml = (html, date) => {
  const [, year, month, day] = date.match(/^(\d{4})-(\d{2})-(\d{2})$/) || [];
  if (!year) throw new Error("invalid menu date");
  const targetDate = `${Number(month)}월 ${Number(day)}일`;
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const row = rows.find((match) => cleanText(match[1]).includes(targetDate));
  if (!row) throw new Error(`menu date not found: ${date}`);

  const menus = { breakfast: [], lunch: [], dinner: [] };
  const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
  cells.slice(1).forEach((cell) => {
    const text = cleanText(cell[1]);
    const meal = text.match(/^(조식|중식|석식)/);
    if (!meal) return;
    const key = meal[1] === "조식" ? "breakfast" : meal[1] === "중식" ? "lunch" : "dinner";
    menus[key].push(text);
  });
  if (Object.values(menus).every((menu) => menu.length === 0)) throw new Error("menu structure not found");
  return menus;
};

export const crawlMenu = async (date, restaurant = "10", fetchImpl = fetch) => {
  const response = await fetchImpl(sourceUrlFor(date, restaurant));
  if (!response.ok) throw new Error(`source request failed: ${response.status}`);
  return parseMenuHtml(await response.text(), date);
};
