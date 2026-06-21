// ===== STORAGE UTILITIES =====

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function saveCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}

function updateUserInStorage(updatedUser) {
  let users = getUsers();
  const idx = users.findIndex(u => u.id === updatedUser.id);
  if (idx !== -1) {
    users[idx] = updatedUser;
    saveUsers(users);
    saveCurrentUser(updatedUser);
  }
}

function generateAccountNumber() {
  const users = getUsers();
  return "ACC" + String(1001 + users.length).padStart(4, "0");
}
