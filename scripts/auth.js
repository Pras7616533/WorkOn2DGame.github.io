const USER_STORE_KEY = "twoDGameUsers";
const CSV_STORE_KEY = "twoDGameUsersCsv";
const SESSION_STORE_KEY = "twoDGameSession";
const CSV_HEADER = "id,first_name,last_name,email,username,password_hash,created_at";

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_STORE_KEY) || "[]");
  } catch (error) {
    return [];
  }
};

const setUsers = (users) => {
  localStorage.setItem(USER_STORE_KEY, JSON.stringify(users));
};

const escapeCsv = (value) => {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
};

const toCsvRow = (user) => {
  return [
    user.id,
    user.first_name,
    user.last_name,
    user.email,
    user.username,
    user.password_hash,
    user.created_at,
  ]
    .map(escapeCsv)
    .join(",");
};

const appendUserCsv = (user) => {
  let csv = localStorage.getItem(CSV_STORE_KEY);
  if (!csv || !csv.startsWith(CSV_HEADER)) {
    csv = `${CSV_HEADER}\n`;
  }
  csv += `${toCsvRow(user)}\n`;
  localStorage.setItem(CSV_STORE_KEY, csv);
};

const downloadUsersCsv = () => {
  const csv = localStorage.getItem(CSV_STORE_KEY) || `${CSV_HEADER}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "users.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

const hashPassword = async (password) => {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }
  return btoa(unescape(encodeURIComponent(password)));
};

const setSession = (payload, remember) => {
  const session = JSON.stringify(payload);
  if (remember) {
    localStorage.setItem(SESSION_STORE_KEY, session);
    sessionStorage.removeItem(SESSION_STORE_KEY);
  } else {
    sessionStorage.setItem(SESSION_STORE_KEY, session);
    localStorage.removeItem(SESSION_STORE_KEY);
  }
};

const getSession = () => {
  const stored =
    sessionStorage.getItem(SESSION_STORE_KEY) ||
    localStorage.getItem(SESSION_STORE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (error) {
    return null;
  }
};

const clearSession = () => {
  sessionStorage.removeItem(SESSION_STORE_KEY);
  localStorage.removeItem(SESSION_STORE_KEY);
};

const requireAuth = () => {
  const body = document.body;
  if (!body || body.dataset.requireAuth !== "true") return;
  const session = getSession();
  if (!session) {
    const loginPath = body.dataset.loginPath || "./login.html";
    window.location.href = loginPath;
  }
};

const ensureMessage = (form) => {
  let message = form.querySelector(".form-message");
  if (!message) {
    message = document.createElement("div");
    message.className = "form-message";
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    message.style.marginTop = "12px";
    message.style.fontWeight = "600";
    form.appendChild(message);
  }
  return message;
};

const setMessage = (element, text, type) => {
  element.textContent = text;
  if (type === "error") {
    element.style.color = "#c0392b";
  } else if (type === "success") {
    element.style.color = "#12805c";
  } else {
    element.style.color = "#1b1c1e";
  }
};

const setupRegister = () => {
  const form = document.querySelector(".register-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = ensureMessage(form);

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value;
    const confirm = document.getElementById("register-confirm").value;
    const terms = form.querySelector("input[name='terms']").checked;

    if (password.length < 6) {
      setMessage(message, "Password must be at least 6 characters.", "error");
      return;
    }

    if (password !== confirm) {
      setMessage(message, "Passwords do not match.", "error");
      return;
    }

    if (!terms) {
      setMessage(message, "You must agree to the terms to continue.", "error");
      return;
    }

    const users = getUsers();
    const emailKey = email.toLowerCase();
    const usernameKey = username.toLowerCase();

    if (users.some((user) => user.email.toLowerCase() === emailKey)) {
      setMessage(message, "That email is already registered.", "error");
      return;
    }

    if (users.some((user) => user.username.toLowerCase() === usernameKey)) {
      setMessage(message, "That username is already taken.", "error");
      return;
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: createId(),
      first_name: firstName,
      last_name: lastName,
      email,
      username,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    setUsers(users);
    appendUserCsv(newUser);

    setMessage(message, "Account created. You can log in now.", "success");
    form.reset();
  });
};

const setupLogin = () => {
  const form = document.querySelector(".login-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = ensureMessage(form);

    const identity = document.getElementById("login-identity").value.trim();
    const password = document.getElementById("login-password").value;
    const remember = form.querySelector("input[name='remember']").checked;

    const users = getUsers();
    const identityKey = identity.toLowerCase();
    const found = users.find(
      (user) =>
        user.email.toLowerCase() === identityKey ||
        user.username.toLowerCase() === identityKey
    );

    if (!found) {
      setMessage(message, "No account found for that email or username.", "error");
      return;
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== found.password_hash) {
      setMessage(message, "Incorrect password. Try again.", "error");
      return;
    }

    setSession(
      {
        user_id: found.id,
        username: found.username,
        logged_in_at: new Date().toISOString(),
      },
      remember
    );

    setMessage(message, `Welcome back, ${found.username}!`, "success");
    form.reset();

    setTimeout(() => {
      window.location.href = "./home.html";
    }, 700);
  });
};

const setupLogout = () => {
  const logoutLinks = document.querySelectorAll("[data-logout]");
  if (!logoutLinks.length) return;
  logoutLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      clearSession();
      const redirect = link.getAttribute("data-logout") || "../index.html";
      window.location.href = redirect;
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  setupRegister();
  setupLogin();
  setupLogout();
  window.downloadUsersCsv = downloadUsersCsv;
});
