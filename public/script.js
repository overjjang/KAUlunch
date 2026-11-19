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
    const entries = Array.isArray(value)
      ? value.map((entry) => typeof entry === "string" ? { category: labels[key], menu: entry } : entry)
      : [value];
    if (entries.length === 0) return;
    const card = document.createElement("article");
    card.className = "menu-card";
    const title = document.createElement("h2");
    title.textContent = labels[key];
    card.append(title);
    entries.forEach((entry) => {
      const option = document.createElement("section");
      option.className = "menu-option";
      const optionHeader = document.createElement("div");
      optionHeader.className = "menu-option-header";
      const category = document.createElement("h3");
      category.textContent = entry.category || labels[key];
      optionHeader.append(category);
      if (entry.price) {
        const price = document.createElement("span");
        price.className = "price";
        price.textContent = entry.price;
        optionHeader.append(price);
      }
      const content = document.createElement("p");
      content.textContent = entry.menu || "등록된 식단이 없습니다.";
      option.append(optionHeader, content);
      if (entry.hours) {
        const hours = document.createElement("small");
        hours.className = "hours";
        hours.textContent = entry.hours;
        option.append(hours);
      }
      card.append(option);
    });
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
