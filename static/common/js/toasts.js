function showToast(message) {
  const toastHtml = `
        <div class="toast align-items-center text-bg-dark border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`;
  const toastContainer = document.getElementById("toast-container");
  if (toastContainer) {
    toastContainer.insertAdjacentHTML("beforeend", toastHtml);
    const toastEl = toastContainer.lastElementChild;
    new bootstrap.Toast(toastEl, { delay: 3000 }).show();
  }
}
