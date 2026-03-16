function showToast(code, message) {
  const statusCode = Number(code) || 0;
  const text = message || "Co thong bao moi";

  let toneClass = "bg-red-600";
  if (statusCode === 200) {
    toneClass = "bg-green-600";
  } else if (statusCode >= 400 && statusCode < 500) {
    toneClass = "bg-amber-500";
  } else if (statusCode >= 500) {
    toneClass = "bg-red-600";
  }

  let root = document.getElementById("appToastContainer");
  if (!root) {
    root = document.createElement("div");
    root.id = "appToastContainer";
    root.className =
      "fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none";
    document.body.appendChild(root);
  }

  const toast = document.createElement("div");
  toast.className = `${toneClass} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-semibold max-w-sm pointer-events-auto`;
  toast.textContent = text;
  root.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    if (root && root.children.length === 0) {
      root.remove();
    }
  }, 3000);
}

window.showToast = showToast;
