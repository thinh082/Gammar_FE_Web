const USER_ME_ENDPOINT = "http://localhost:5062/api/User/me";

const sidebarFullnameEl = document.getElementById("sidebarFullname");
const sidebarEmailEl = document.getElementById("sidebarEmail");
const profileFullnameEl = document.getElementById("profileFullname");
const profileEmailEl = document.getElementById("profileEmail");
const profileCreatedAtEl = document.getElementById("profileCreatedAt");
const todayGenCountEl = document.getElementById("todayGenCount");
const todayCostEl = document.getElementById("todayCost");
const todayCostRowEl = document.getElementById("todayCostRow");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");

function formatDate(input) {
  if (!input) return "--";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("vi-VN");
}

function bindUserData(data) {
  const fullname = data?.fullname || "Chua cap nhat";
  const email = data?.email || "--";
  const totalGen = data?.totalGen ?? data?.TotalGen ?? 0;
  const totalCost = data?.totalCost ?? data?.TotalCost ?? 0;

  if (sidebarFullnameEl) sidebarFullnameEl.textContent = fullname;
  if (sidebarEmailEl) sidebarEmailEl.textContent = email;
  if (profileFullnameEl) profileFullnameEl.value = fullname;
  if (profileEmailEl) profileEmailEl.value = email;
  if (profileCreatedAtEl) profileCreatedAtEl.value = formatDate(data?.createdAt);
  if (todayGenCountEl) todayGenCountEl.textContent = `${totalGen}`;
  if (todayCostEl) todayCostEl.textContent = `${totalCost}`;
  if (todayCostRowEl) {
    todayCostRowEl.classList.toggle("hidden", Number(totalGen) === 0);
  }

  localStorage.setItem(
    "user",
    JSON.stringify({
      fullname: data?.fullname || null,
      email: data?.email || null,
    })
  );
}

function extractValidationMessage(data) {
  if (!data || typeof data !== "object") return "";
  const firstKey = Object.keys(data)[0];
  if (!firstKey) return "";
  const firstValue = data[firstKey];
  if (Array.isArray(firstValue) && firstValue.length > 0) {
    return String(firstValue[0]);
  }
  return "";
}

async function fetchMe() {
  try {
    const response = await fetch(USER_ME_ENDPOINT, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let result = null;
    try {
      result = await response.json();
    } catch (error) {
      result = null;
    }

    if (response.status === 401 || result?.code === 401) {
      localStorage.removeItem("user");
      // window.location.href = "./login.html";
      return;
    }

    if (!response.ok || result?.code !== 200 || !result?.data) {
      console.error("Khong lay duoc thong tin nguoi dung", result);
      return;
    }

    bindUserData(result.data);
  } catch (error) {
    console.error("Loi ket noi endpoint /me", error);
  }
}

async function updateProfile() {
  if (!profileFullnameEl || !profileEmailEl) return;

  const fullname = profileFullnameEl.value.trim();
  const email = profileEmailEl.value.trim();

  if (!fullname || !email) {
    showToast(400, "Vui lòng nhập đầy đủ họ tên và email.");
    return;
  }

  if (saveProfileBtn) {
    saveProfileBtn.disabled = true;
    saveProfileBtn.classList.add("opacity-70", "cursor-not-allowed");
  }

  try {
    const response = await fetch(USER_ME_ENDPOINT, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullname, email }),
    });

    let result = null;
    try {
      result = await response.json();
    } catch (error) {
      result = null;
    }

    if (response.status === 401 || result?.code === 401) {
      showToast(401, result?.message || "Không thể xác thực người dùng");
      localStorage.removeItem("user");
      window.location.href = "./login.html";
      return;
    }

    if (response.ok && result?.code === 200 && result?.data) {
      bindUserData(result.data);
      showToast(200, result.message || "Cập nhật thông tin thành công.");
      return;
    }

    const validateMessage = extractValidationMessage(result?.data);
    showToast(
      result?.code || response.status || 400,
      validateMessage || result?.message || "Cập nhật thất bại, vui lòng thử lại."
    );
  } catch (error) {
    showToast(500, "Không thể kết nối đến máy chủ. Vui lòng thử lại.");
  } finally {
    if (saveProfileBtn) {
      saveProfileBtn.disabled = false;
      saveProfileBtn.classList.remove("opacity-70", "cursor-not-allowed");
    }
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    localStorage.removeItem("user");
    window.location.href = "./login.html";
  });
}

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", updateProfile);
}

document.addEventListener("DOMContentLoaded", fetchMe);

