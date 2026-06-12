// ===== DASHBOARD LOGIC =====

// Guard: redirect if not logged in
(function () {
  if (!getCurrentUser()) window.location.href = "index.html";
})();

let currentSection  = "overview";
let txnFilter       = "All";
let txnSort         = "newest";
let darkMode        = localStorage.getItem("darkMode") === "true";

function refreshDashboard() {
  const user = getCurrentUser();
  if (!user) return;

  // Header info
  document.getElementById("user-name").textContent    = user.name;
  document.getElementById("acc-number").textContent   = user.accountNumber || "ACC----";
  document.getElementById("balance-display").textContent = formatCurrency(user.balance);

  // Profile section
  if (document.getElementById("profile-name")) {
    document.getElementById("profile-name").textContent  = user.name;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-acc").textContent   = user.accountNumber || "ACC----";
    document.getElementById("profile-bal").textContent   = formatCurrency(user.balance);
    document.getElementById("edit-name-input").value     = user.name;
  }

  renderTransactions(user.transactions);
  updateStats(user.transactions);
}

function renderTransactions(transactions) {
  const tbody    = document.getElementById("txn-tbody");
  const emptyEl  = document.getElementById("txn-empty");
  if (!tbody) return;

  let filtered = [...transactions];

  // Filter
  if (txnFilter !== "All") {
    filtered = filtered.filter(t => t.type === txnFilter);
  }

  // Search
  const searchVal = document.getElementById("txn-search")?.value.toLowerCase() || "";
  if (searchVal) {
    filtered = filtered.filter(t =>
      t.type.toLowerCase().includes(searchVal) ||
      (t.note && t.note.toLowerCase().includes(searchVal)) ||
      t.amount.toString().includes(searchVal)
    );
  }

  // Sort
  if (txnSort === "oldest") filtered.reverse();
  else if (txnSort === "highest") filtered.sort((a, b) => b.amount - a.amount);
  else if (txnSort === "lowest")  filtered.sort((a, b) => a.amount - b.amount);

  tbody.innerHTML = "";
  if (filtered.length === 0) {
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  filtered.forEach(t => {
    const tr = document.createElement("tr");
    const isCredit = t.type === "Deposit" || t.type === "Transfer Received";
    tr.innerHTML = `
      <td><span class="badge badge-${t.type.replace(/\s/g,'-').toLowerCase()}">${t.type}</span></td>
      <td class="${isCredit ? 'amount-credit' : 'amount-debit'}">
        ${isCredit ? "+" : "-"}${formatCurrency(t.amount)}
      </td>
      <td>${t.note || "—"}</td>
      <td>${t.date}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateStats(transactions) {
  const totalDeposit  = transactions.filter(t => t.type === "Deposit").reduce((s, t) => s + t.amount, 0);
  const totalWithdraw = transactions.filter(t => t.type === "Withdrawal").reduce((s, t) => s + t.amount, 0);
  const totalTransfer = transactions.filter(t => t.type === "Transfer Sent").reduce((s, t) => s + t.amount, 0);

  const el = id => document.getElementById(id);
  if (el("stat-deposit"))  el("stat-deposit").textContent  = formatCurrency(totalDeposit);
  if (el("stat-withdraw")) el("stat-withdraw").textContent = formatCurrency(totalWithdraw);
  if (el("stat-transfer")) el("stat-transfer").textContent = formatCurrency(totalTransfer);
  if (el("stat-txn-count")) el("stat-txn-count").textContent = transactions.length;
}

function showSection(name) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("sec-" + name)?.classList.add("active");
  document.querySelector(`[data-section="${name}"]`)?.classList.add("active");
  currentSection = name;

  // Close mobile sidebar
  document.getElementById("sidebar").classList.remove("open");
}

function handleLogout() {
  clearCurrentUser();
  window.location.href = "index.html";
}

function handleProfileUpdate(e) {
  e.preventDefault();
  const newName = document.getElementById("edit-name-input").value.trim();
  if (!newName) return;
  let user = getCurrentUser();
  user.name = newName;
  updateUserInStorage(user);
  showTxnMsg(document.getElementById("profile-msg"), "Name updated!", "success");
  refreshDashboard();
}

function toggleDarkMode() {
  darkMode = !darkMode;
  localStorage.setItem("darkMode", darkMode);
  applyDarkMode();
}

function applyDarkMode() {
  document.body.classList.toggle("dark", darkMode);
  const icon = document.getElementById("dark-icon");
  if (icon) icon.textContent = darkMode ? "☀️" : "🌙";
}

function formatCurrency(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Init
window.addEventListener("DOMContentLoaded", () => {
  applyDarkMode();
  refreshDashboard();
  showSection("overview");

  document.getElementById("txn-search")?.addEventListener("input", refreshDashboard);

  document.getElementById("txn-filter")?.addEventListener("change", e => {
    txnFilter = e.target.value;
    refreshDashboard();
  });

  document.getElementById("txn-sort")?.addEventListener("change", e => {
    txnSort = e.target.value;
    refreshDashboard();
  });

  document.getElementById("hamburger")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
});
