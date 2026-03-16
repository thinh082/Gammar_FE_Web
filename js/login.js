const LOGIN_ENDPOINT = "http://localhost:5062/api/Auth/login";
const GOOGLE_CLIENT_ID =
  "596598398379-in2t43evk7clm9pffdjrvm8jg5mit72d.apps.googleusercontent.com";
const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginSubmit = document.getElementById("loginSubmit");
const loginMessage = document.getElementById("loginMessage");
const googleLoginBtn = document.getElementById("googleLoginBtn");

function showMessage(message, isSuccess) {
  loginMessage.textContent = message;
  loginMessage.classList.remove("hidden", "text-error", "text-green-600");
  loginMessage.classList.add(isSuccess ? "text-green-600" : "text-error");
}

function setLoading(isLoading) {
  loginSubmit.disabled = isLoading;
  loginSubmit.classList.toggle("opacity-70", isLoading);
  loginSubmit.classList.toggle("cursor-not-allowed", isLoading);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.classList.add("hidden");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Vui long nhap day du email va mat khau.", false);
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    if (response.ok && result?.code === 200) {
      localStorage.setItem("user", JSON.stringify(result.data || {}));
      showMessage(result.message || "Dang nhap thanh cong.", true);
      window.location.href = "./index.html";
      return;
    }

    showMessage(
      result?.message || "Email hoac mat khau khong chinh xac.",
      false
    );
  } catch (error) {
    showMessage("Khong the ket noi den may chu. Vui long thu lai.", false);
  } finally {
    setLoading(false);
  }
});

function buildGoogleAuthUrl() {
  const state = Math.random().toString(36).slice(2);
  const nonce = Math.random().toString(36).slice(2);
  sessionStorage.setItem("google_oauth_state", state);
  sessionStorage.setItem("google_oauth_nonce", nonce);

  const redirectUri = `${window.location.origin}/google-callback.html`;
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "id_token",
    scope: "openid email profile",
    prompt: "select_account",
    state,
    nonce,
  });

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", () => {
    window.location.href = buildGoogleAuthUrl();
  });
}
