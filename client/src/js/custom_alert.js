const customAlert = document.getElementById("customAlert");
const alertMessage = document.getElementById("alertMessage");
const alertOkBtn = document.getElementById("alertOkBtn");

function showAlert(message, targetInput = null) {
    if (!customAlert || !alertMessage || !alertOkBtn) return;

    alertMessage.textContent = message;
    customAlert.classList.remove("hidden");

    alertOkBtn.onclick = function() {
        customAlert.classList.add("hidden");
        if (targetInput) {
            targetInput.focus();
        }
    };
}

const customConfirm = document.getElementById("customConfirm");
const confirmMessage = document.getElementById("confirmMessage");
const confirmOkBtn = document.getElementById("confirmOkBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");

function showConfirm(message) {
    return new Promise((resolve) => {
        if (!customConfirm || !confirmMessage || !confirmOkBtn || !confirmCancelBtn) {
            resolve(window.confirm(message));
            return;
        }

        confirmMessage.textContent = message;
        customConfirm.classList.remove("hidden");

        function handleChoice(confirmed) {
            customConfirm.classList.add("hidden");
            confirmOkBtn.removeEventListener("click", onOk);
            confirmCancelBtn.removeEventListener("click", onCancel);
            resolve(confirmed);
        }

        function onOk() {
            handleChoice(true);
        }

        function onCancel() {
            handleChoice(false);
        }

        confirmOkBtn.addEventListener("click", onOk);
        confirmCancelBtn.addEventListener("click", onCancel);
    });
}