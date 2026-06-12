// ===== AUTH LOGIC =====

function handleRegister(e) {
  e.preventDefault();
  const name     = document.getElementById("name").value.trim();
  const email    = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const confirm  = document.getElementById("confirm").value;
  const msgEl    = document.getElementById("auth-msg");

  if (!name || !email || !password || !confirm) {
    showMsg(msgEl, "All fields are required.", "error");
    return;
  }
  if (password !== confirm) {
    showMsg(msgEl, "Passwords do not match.", "error");
    return;
  }
  if (password.length < 4) {
    showMsg(msgEl, "Password must be at least 4 characters.", "error");
    return;
  }

  let users = getUsers();
  if (users.find(u => u.email === email)) {
    showMsg(msgEl, "This email is already registered.", "error");
    return;
  }

  const newUser = {
    id: Date.now(),
    accountNumber: generateAccountNumber(),
    name,
    email,
    password,
    balance: 0,
    transactions: []
  };

  users.push(newUser);
  saveUsers(users);
  showMsg(msgEl, "Account created! Redirecting to login…", "success");
  setTimeout(() => window.location.href = "index.html", 1500);
}

function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const msgEl    = document.getElementById("auth-msg");

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showMsg(msgEl, "Invalid email or password.", "error");
    return;
  }

  saveCurrentUser(user);
  window.location.href = "dashboard.html";
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.className   = "auth-msg " + type;
}
