let intervalId;

// Fungsi untuk mengirim perintah ke tab aktif
function sendMessageToTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (msg) => {
        if (msg.action === "start") {
          let baseDelay = msg.delay;
          window.autoLoveRunning = true;

          function clickWithRandomDelay() {
            if (!window.autoLoveRunning) return;

            let loveButtons = document.querySelectorAll('[data-e2e="room-chat-like-btn"]');
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

            // Tambahkan jitter acak antara -20% dan +20% dari base delay
            let jitter = baseDelay * 0.2;
            let randomDelay = baseDelay + (Math.random() * jitter * 2 - jitter);

            window.autoLoveTimeout = setTimeout(clickWithRandomDelay, randomDelay);
          }

          // Mulai loop
          clickWithRandomDelay();
        } else if (msg.action === "stop") {
          window.autoLoveRunning = false;
          clearTimeout(window.autoLoveTimeout);
        }
      },
      args: [message],
    });
  });
}

// Tombol Start
document.getElementById("start").addEventListener("click", () => {
  const delay = parseInt(document.getElementById("delay").value, 10);
  sendMessageToTab({ action: "start", delay });
  document.getElementById("start").disabled = true;
  document.getElementById("stop").disabled = false;
});

// Tombol Stop
document.getElementById("stop").addEventListener("click", () => {
  sendMessageToTab({ action: "stop" });
  document.getElementById("start").disabled = false;
  document.getElementById("stop").disabled = true;
});
