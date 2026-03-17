const authActions = document.getElementById("authActions");
const LOGOUT_ENDPOINT = "/api/auth/logout";

function getCurrentUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    return null;
  }
}

async function logout() {
  try {
    await apiFetch(LOGOUT_ENDPOINT, {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout request failed", error);
  } finally {
    localStorage.removeItem("user");
    window.location.href = "./login.html";
  }
}

function renderProfileButton(user) {
  if (!authActions) {
    return;
  }

  const displayName = user?.fullname || user?.email || "Profile";
  const initial = (displayName || "U").trim().charAt(0).toUpperCase();

  authActions.innerHTML = `
    <a
      href="setting.html"
      class="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition-all"
      title="${displayName}"
      aria-label="Mở trang cá nhân"
    >
      <span class="material-symbols-outlined text-[20px]">person</span>
    </a>
    <button
      id="headerLogoutBtn"
      type="button"
      class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-red-500 hover:text-red-500 transition-all"
      title="Đăng xuất"
      aria-label="Đăng xuất"
    >
      <span class="material-symbols-outlined text-[20px]">logout</span>
    </button>
  `;

  if (!displayName) {
    return;
  }

  const profileLink = authActions.querySelector("a");
  if (profileLink) {
    profileLink.dataset.initial = initial;
  }

  const logoutBtn = document.getElementById("headerLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

function initAuthActions() {
  const user = getCurrentUser();
  if (user) {
    renderProfileButton(user);
  }
}

document.addEventListener("DOMContentLoaded", initAuthActions);
