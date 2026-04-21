let intervalId;

// Fungsi untuk mengirim perintah ke tab aktif
function sendMessageToTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (msg) => {
        if (msg.action === "start") {
          let delay = msg.delay;
          window.autoLoveInterval = setInterval(() => {
            let loveButtons = document.querySelectorAll('[data-e2e="room-chat-like-btn"]');
            loveButtons.forEach(button => button.click());
          }, delay);
        } else if (msg.action === "stop") {
          clearInterval(window.autoLoveInterval);
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
