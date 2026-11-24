const STORAGE_KEY = "student-expense-tracker-v1";
const categories = ["Food", "Travel", "Shopping", "Education", "Other"];
const icons = {
  Food: "🥗",
  Travel: "🚌",
  Shopping: "🛍️",
  Education: "📚",
  Other: "✦",
};
const form = document.querySelector("#expense-form");
const nameInput = document.querySelector("#expense-name");
const amountInput = document.querySelector("#expense-amount");
const categoryInput = document.querySelector("#expense-category");
const categoryFilter = document.querySelector("#category-filter");
const expenseList = document.querySelector("#expense-list");
const emptyState = document.querySelector("#empty-state");
const totalAmount = document.querySelector("#total-amount");
const expenseCount = document.querySelector("#expense-count");
const formError = document.querySelector("#form-error");

function loadExpenses() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved)
      ? saved.filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            Number.isFinite(item.amount) &&
            item.amount > 0 &&
            categories.includes(item.category),
        )
      : [];
  } catch {
    return [];
  }
}

let expenses = loadExpenses();
const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    /* Storage may be unavailable. */
  }
}

function renderExpenses() {
  const category = categoryFilter.value;
  const visible =
    category === "All"
      ? expenses
      : expenses.filter((item) => item.category === category);
  totalAmount.textContent = money(
    expenses.reduce((sum, item) => sum + item.amount, 0),
  );
  expenseCount.textContent = String(expenses.length);
  expenseList.replaceChildren();

  [...visible].reverse().forEach((item) => {
    const row = document.createElement("article");
    row.className = "expense-item";
    const main = document.createElement("div");
    main.className = "expense-main";
    const icon = document.createElement("span");
    icon.className = "category-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = icons[item.category];
    const text = document.createElement("div");
    text.className = "expense-text";
    const name = document.createElement("p");
    name.className = "expense-name";
    name.textContent = item.name;
    const tag = document.createElement("span");
    tag.className = "expense-category";
    tag.textContent = item.category;
    text.append(name, tag);
    main.append(icon, text);
    const amount = document.createElement("span");
    amount.className = "expense-amount";
    amount.textContent = money(item.amount);
    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete ${item.name}`);
    remove.addEventListener("click", () => {
      expenses = expenses.filter((expense) => expense.id !== item.id);
      saveExpenses();
      renderExpenses();
    });
    row.append(main, amount, remove);
    expenseList.append(row);
  });

  emptyState.hidden = visible.length > 0;
  emptyState.querySelector("h3").textContent =
    expenses.length && !visible.length
      ? "No expenses in this category"
      : "No expenses yet";
  emptyState.querySelector("p").textContent =
    expenses.length && !visible.length
      ? "Try another category or add a new expense."
      : "Add your first expense and it’ll show up here.";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formError.textContent = "";
  const name = nameInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  if (!name) {
    formError.textContent = "Please enter an expense name.";
    nameInput.focus();
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    formError.textContent = "Enter an amount greater than zero.";
    amountInput.focus();
    return;
  }
  if (!categories.includes(category)) {
    formError.textContent = "Please choose a valid category.";
    categoryInput.focus();
    return;
  }
  expenses.push({
    id:
      globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    amount: Math.round(amount * 100) / 100,
    category,
  });
  saveExpenses();
  renderExpenses();
  form.reset();
  categoryInput.value = "Food";
  nameInput.focus();
});

categoryFilter.addEventListener("change", renderExpenses);
renderExpenses();
