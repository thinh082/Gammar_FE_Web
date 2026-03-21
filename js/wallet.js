const walletTopupForm = document.getElementById("walletTopupForm");
const topupAmountInput = document.getElementById("topup-amount");
const createPaymentLinkBtn = document.getElementById("createPaymentLinkBtn");
const walletTopupMessage = document.getElementById("walletTopupMessage");
const embeddedPaymentContainer = document.getElementById(
  "embedded-payment-container"
);

let currentPayment = null;


// ─── Payment Success Detection ───────────────────────────────────────────────

/**
 * Gọi API lấy số dư mới nhất và cập nhật UI
 */
async function fetchAndUpdateBalance() {
  try {
    const response = await apiFetch("/api/Wallet/balance", { method: "GET" });
    if (!response.ok) return;
    const data = await response.json();
    // Hỗ trợ nhiều dạng response: { balance }, { data: { balance } }, { amount } ...
    const balance =
      data?.balance ?? data?.data?.balance ?? data?.amount ?? data?.data?.amount ?? null;
    if (balance === null) return;
    const balanceEl = document.querySelector("h3.text-4xl.text-primary");
    if (balanceEl) {
      balanceEl.textContent = Number(balance).toLocaleString("vi-VN") + " đ";
    }
  } catch (_) {
    // Không hiển thị lỗi nếu refresh balance fail — không quan trọng
  }
}

/**
 * Xử lý sau khi PayOS xác nhận thanh toán thành công
 */
function handlePaymentSuccess(orderCode) {
  closeEmbeddedCheckout();
  showTopupMessage(
    `✅ Nạp tiền thành công! Mã đơn hàng: ${orderCode || "N/A"}`,
    true
  );
  fetchAndUpdateBalance();
  // Xoá query params khỏi URL để tránh trigger lại khi refresh
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
}

/**
 * Kiểm tra URL params khi page load (PayOS redirect parent window)
 * VD: wallet.html?orderCode=12345&status=PAID&code=00
 */
function checkPayosReturnParams() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  const code   = params.get("code");
  const orderCode = params.get("orderCode");
  if (status === "PAID" || code === "00") {
    handlePaymentSuccess(orderCode);
  }
}

checkPayosReturnParams();


function showTopupMessage(message, isSuccess) {
  if (!walletTopupMessage) return;
  walletTopupMessage.textContent = message;
  walletTopupMessage.classList.remove("hidden", "text-red-500", "text-green-600");
  walletTopupMessage.classList.add(isSuccess ? "text-green-600" : "text-red-500");
}

function clearTopupMessage() {
  if (!walletTopupMessage) return;
  walletTopupMessage.textContent = "";
  walletTopupMessage.classList.add("hidden");
}




async function createPaymentLink(amount) {
  const response = await apiFetch(
    `/api/Wallet/create?Amount=${encodeURIComponent(amount)}`,
    {
      method: "POST",
    }
  );

  let result = null;
  try {
    result = await response.json();
  } catch (error) {
    result = null;
  }

  const checkoutUrl =
    result?.checkoutUrl ||
    result?.response?.checkoutUrl ||
    result?.data?.checkoutUrl ||
    result?.data?.url ||
    "";
  const qrCode =
    result?.qrCode || result?.response?.qrCode || result?.data?.qrCode || "";

  // Ưu tiên dùng checkoutUrl nếu có, bất kể HTTP status code
  // (backend có thể trả 400 nhưng vẫn kèm checkoutUrl hợp lệ)
  if (checkoutUrl) {
    return {
      checkoutUrl: checkoutUrl.trim(),
      qrCode: String(qrCode || "").trim(),
    };
  }

  // Chỉ throw error khi thực sự không có checkoutUrl
  if (!response.ok) {
    const errorMessage =
      result?.message || "Khong tao duoc link thanh toan. Vui long thu lai.";
    throw new Error(errorMessage);
  }
  throw new Error("Server khong tra ve checkoutUrl hop le.");
}

async function openPaymentWindow() {
  const amountRaw = (topupAmountInput?.value || "").trim();
  const amount = Number(amountRaw);

  if (!Number.isFinite(amount) || amount < 1000) {
    showTopupMessage("Vui lòng nhập số tiền từ 1.000đ trở lên.", false);
    return;
  }

  clearTopupMessage();
  createPaymentLinkBtn?.setAttribute("disabled", "true");
  createPaymentLinkBtn?.classList.add("opacity-70", "cursor-not-allowed");

  try {
    const { checkoutUrl } = await createPaymentLink(amount);
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    showTopupMessage("Đã mở trang thanh toán PayOS. Sau khi thanh toán xong, số dư sẽ được cập nhật tự động.", true);
  } catch (error) {
    showTopupMessage(error.message || "Có lỗi xảy ra khi tạo thanh toán.", false);
  } finally {
    createPaymentLinkBtn?.removeAttribute("disabled");
    createPaymentLinkBtn?.classList.remove("opacity-70", "cursor-not-allowed");
  }
}

if (walletTopupForm) {
  walletTopupForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

if (createPaymentLinkBtn) {
  createPaymentLinkBtn.addEventListener("click", async () => {
    await openPaymentWindow();
  });
}

// ─── Khởi tạo: load số dư từ API khi trang mở ─────────────────────────────
fetchAndUpdateBalance();
