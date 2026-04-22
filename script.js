let intervalId;

let statusInterval;

// Fungsi untuk mengirim perintah ke tab aktif dan menangani respons
function sendMessageToTab(message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (msg) => {
        if (!window.autoLoveClickCount) {
          window.autoLoveClickCount = 0;
        }

        if (msg.action === "start") {
          let baseDelay = msg.delay;
          window.autoLoveRunning = true;
          window.autoLoveClickCount = 0; // Reset counter on start

          function clickWithRandomDelay() {
            if (!window.autoLoveRunning) return;

            let loveButtons = document.querySelectorAll('[data-e2e="room-chat-like-btn"]');
            if (loveButtons.length > 0) {
              window.autoLoveClickCount++;
              loveButtons.forEach(button => {
                // Simulasi event klik yang lebih realistis
                const events = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
                events.forEach(eventType => {
                  const event = new MouseEvent(eventType, {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    buttons: 1
                  });
                  button.dispatchEvent(event);
                });
              });
            }

            // Tambahkan jitter acak antara -20% dan +20% dari base delay
            let jitter = baseDelay * 0.2;
            let randomDelay = baseDelay + (Math.random() * jitter * 2 - jitter);

            window.autoLoveTimeout = setTimeout(clickWithRandomDelay, randomDelay);
          }

          // Hentikan timeout lama jika ada sebelum memulai baru
          clearTimeout(window.autoLoveTimeout);
          // Mulai loop
          clickWithRandomDelay();

        } else if (msg.action === "stop") {
          window.autoLoveRunning = false;
          clearTimeout(window.autoLoveTimeout);
        } else if (msg.action === "status") {
          // Hanya mengembalikan status saat ini
        }

        return {
          isRunning: !!window.autoLoveRunning,
          clicks: window.autoLoveClickCount || 0
        };
      },
      args: [message],
    }, (results) => {
      if (results && results[0] && callback) {
        callback(results[0].result);
      }
    });
  });
}

function updateUI(state) {
  const startBtn = document.getElementById("start");
  const stopBtn = document.getElementById("stop");
  const statusText = document.getElementById("status-text");
  const clickCount = document.getElementById("click-count");

  if (state.isRunning) {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusText.textContent = "ON";
    statusText.className = "stat-value text-green";
  } else {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.textContent = "OFF";
    statusText.className = "stat-value text-red";
  }

  clickCount.textContent = state.clicks;
}

function checkStatus() {
  sendMessageToTab({ action: "status" }, (state) => {
    updateUI(state);
  });
}

// Inisialisasi saat popup dibuka
document.addEventListener('DOMContentLoaded', () => {
  checkStatus();
  // Polling status secara berkala untuk update counter secara real-time
  statusInterval = setInterval(checkStatus, 1000);
});

// Tombol Start
document.getElementById("start").addEventListener("click", () => {
  const delay = parseInt(document.getElementById("delay").value, 10);
  sendMessageToTab({ action: "start", delay }, (state) => {
    updateUI(state);
  });
});

// Tombol Stop
document.getElementById("stop").addEventListener("click", () => {
  sendMessageToTab({ action: "stop" }, (state) => {
    updateUI(state);
  });
});
