import { fallbackMenus } from "./data/menu.js";

const dateInput = document.querySelector("#menu-date");
const restaurantSelect = document.querySelector("#restaurant-select");
const menuList = document.querySelector("#menu-list");
const status = document.querySelector("#status");
const dayInMilliseconds = 24 * 60 * 60 * 1000;

const toDateValue = (date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
};

const renderMenus = (menus) => {
  menuList.replaceChildren();
  const labels = { breakfast: "조식", lunch: "중식", dinner: "석식" };
  Object.entries(menus).forEach(([key, value]) => {
    const label = Array.isArray(value) ? labels[key] : value.label;
    const menu = Array.isArray(value) ? value.join("\n\n") : value.menu;
    const card = document.createElement("article");
    card.className = "menu-card";
    const title = document.createElement("h2");
    title.textContent = label;
    const content = document.createElement("p");
    content.textContent = menu || "등록된 식단이 없습니다.";
    card.append(title, content);
    menuList.append(card);
  });
};

const loadMenus = async () => {
  const selectedDate = dateInput.value;
  const restaurant = restaurantSelect.value;
  status.className = "status";
  status.textContent = "식단을 불러오는 중입니다.";
  try {
    const response = await fetch(`/api/menu?date=${selectedDate}&restaurant=${restaurant}`);
    if (!response.ok) throw new Error(`menu request failed: ${response.status}`);
    const data = await response.json();
    renderMenus(data.menus);
    status.textContent = data.source === "crawler" ? `${selectedDate} 식단` : `${selectedDate} 식단 (준비 중)`;
  } catch (error) {
    console.error(error);
    renderMenus(fallbackMenus);
    status.className = "status error";
    status.textContent = "식단을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
  }
};

const moveDate = (days) => {
  const nextDate = new Date(`${dateInput.value}T00:00:00`);
  nextDate.setTime(nextDate.getTime() + days * dayInMilliseconds);
  dateInput.value = toDateValue(nextDate);
  loadMenus();
};

dateInput.value = toDateValue(new Date());
dateInput.addEventListener("change", loadMenus);
restaurantSelect.addEventListener("change", loadMenus);
document.querySelector("#previous-day").addEventListener("click", () => moveDate(-1));
document.querySelector("#next-day").addEventListener("click", () => moveDate(1));
loadMenus();
