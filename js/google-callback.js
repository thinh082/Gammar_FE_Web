const GOOGLE_LOGIN_ENDPOINT = "/api/auth/google-login";
const callbackStatusEl = document.getElementById("callbackStatus");

function setStatus(text) {
  if (callbackStatusEl) {
    callbackStatusEl.textContent = text;
  }
}

function parseHashParams() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash);
}

function getIdTokenFromCallback() {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = parseHashParams();

  return (
    queryParams.get("id_token") ||
    hashParams.get("id_token") ||
    queryParams.get("credential") ||
    hashParams.get("credential") ||
    ""
  );
}

function validateState() {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = parseHashParams();
  const callbackState = queryParams.get("state") || hashParams.get("state");
  const expectedState = sessionStorage.getItem("google_oauth_state");

  if (!expectedState) return true;
  return callbackState === expectedState;
}

async function handleGoogleCallback() {
  const idToken = getIdTokenFromCallback();
  const isStateValid = validateState();

  if (!idToken) {
    setStatus("Không nhận được thông tin xác thực từ Google.");
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1500);
    return;
  }

  if (!isStateValid) {
    setStatus("Dữ liệu đăng nhập không hợp lệ. Vui lòng thử lại.");
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1500);
    return;
  }

  try {
    const response = await apiFetch(GOOGLE_LOGIN_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });

    let result = null;
    try {
      result = await response.json();
    } catch (error) {
      result = null;
    }

    if (response.ok && result?.code === 200) {
      if (result?.data) {
        localStorage.setItem("user", JSON.stringify(result.data));
      }
      setStatus(result?.message || "Đăng nhập Google thành công.");
      setTimeout(() => {
        window.location.href = "./index.html";
      }, 500);
      return;
    }

    setStatus(result?.message || "Đăng nhập Google thất bại.");
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1600);
  } catch (error) {
    setStatus("Không thể kết nối máy chủ. Vui lòng thử lại.");
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1600);
  } finally {
    sessionStorage.removeItem("google_oauth_state");
    sessionStorage.removeItem("google_oauth_nonce");
  }
}

document.addEventListener("DOMContentLoaded", handleGoogleCallback);
