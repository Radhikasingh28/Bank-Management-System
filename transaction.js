// ===== TRANSACTION LOGIC =====

function addTransaction(user, type, amount, note = "") {
  const entry = {
    id: Date.now(),
    type,
    amount,
    note,
    date: new Date().toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  };
  user.transactions.unshift(entry);
  return user;
}

function handleDeposit() {
  const amount = parseFloat(document.getElementById("dep-amount").value);
  const msgEl  = document.getElementById("dep-msg");

  if (!validateAmount(amount, msgEl)) return;

  let user = getCurrentUser();
  user.balance += amount;
  user = addTransaction(user, "Deposit", amount);
  updateUserInStorage(user);

  showTxnMsg(msgEl, `₹${amount.toFixed(2)} deposited successfully!`, "success");
  refreshDashboard();
  document.getElementById("dep-amount").value = "";
}

function handleWithdraw() {
  const amount = parseFloat(document.getElementById("wdw-amount").value);
  const msgEl  = document.getElementById("wdw-msg");

  if (!validateAmount(amount, msgEl)) return;

  let user = getCurrentUser();
  if (amount > user.balance) {
    showTxnMsg(msgEl, "Insufficient balance!", "error");
    return;
  }

  user.balance -= amount;
  user = addTransaction(user, "Withdrawal", amount);
  updateUserInStorage(user);

  showTxnMsg(msgEl, `₹${amount.toFixed(2)} withdrawn successfully!`, "success");
  refreshDashboard();
  document.getElementById("wdw-amount").value = "";
}

function handleTransfer() {
  const receiverEmail = document.getElementById("receiver-email").value.trim().toLowerCase();
  const amount        = parseFloat(document.getElementById("transfer-amount").value);
  const msgEl         = document.getElementById("transfer-msg");

  if (!receiverEmail) {
    showTxnMsg(msgEl, "Enter receiver's email.", "error"); return;
  }
  if (!validateAmount(amount, msgEl)) return;

  let sender = getCurrentUser();
  if (receiverEmail === sender.email) {
    showTxnMsg(msgEl, "Cannot transfer to yourself.", "error"); return;
  }

  let users    = getUsers();
  let recIdx   = users.findIndex(u => u.email === receiverEmail);

  if (recIdx === -1) {
    showTxnMsg(msgEl, "Receiver account not found.", "error"); return;
  }
  if (amount > sender.balance) {
    showTxnMsg(msgEl, "Insufficient balance!", "error"); return;
  }

  let receiver = users[recIdx];

  // Update balances
  sender.balance   -= amount;
  receiver.balance += amount;

  // Add transactions
  sender   = addTransaction(sender, "Transfer Sent", amount, `To: ${receiver.name}`);
  receiver = addTransaction(receiver, "Transfer Received", amount, `From: ${sender.name}`);

  // Save both
  const senderIdx = users.findIndex(u => u.id === sender.id);
  users[senderIdx] = sender;
  users[recIdx]    = receiver;
  saveUsers(users);
  saveCurrentUser(sender);

  showTxnMsg(msgEl, `₹${amount.toFixed(2)} sent to ${receiver.name}!`, "success");
  refreshDashboard();
  document.getElementById("receiver-email").value  = "";
  document.getElementById("transfer-amount").value = "";
}

function validateAmount(amount, msgEl) {
  if (isNaN(amount) || amount <= 0) {
    showTxnMsg(msgEl, "Enter a valid amount greater than 0.", "error");
    return false;
  }
  return true;
}

function showTxnMsg(el, text, type) {
  el.textContent = text;
  el.className   = "txn-msg " + type;
  setTimeout(() => { el.textContent = ""; el.className = "txn-msg"; }, 3500);
}
