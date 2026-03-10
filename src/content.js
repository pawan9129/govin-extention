console.log("Gov Extension Content Loaded");

let modal = null;

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TOGGLE_MODAL") {
    toggleModal();
  }
});

function toggleModal() {

  if (modal) {
    modal.remove();
    modal = null;
    return;
  }

  modal = document.createElement("div");
  modal.id = "gov-modal";

  modal.innerHTML = `
    <div class="gov-overlay">
      <div class="gov-modal">

        <div class="gov-header">
          <span>Gov Meeting Scheduler</span>
          <button id="gov-close-btn">✕</button>
        </div>

        <iframe src="${chrome.runtime.getURL("index.html")}" 
                class="gov-iframe">
        </iframe>

      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("gov-close-btn").addEventListener("click", () => {
    modal.remove();
    modal = null;
  });

  addStyles();
}

function addStyles() {

  if (document.getElementById("gov-styles")) return;

  const style = document.createElement("style");
  style.id = "gov-styles";

  style.innerHTML = `
  .gov-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.4);
    display: flex;
    justify-content: flex-end;
    z-index: 999999;
  }

  .gov-modal {
    width: 420px;
    height: 80vh;
    background: white;
    display: flex;
    flex-direction: column;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-in-out;
  }

  .gov-header {
    height: 50px;
    background: #0d6efd;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    font-weight: 600;
  }

  #gov-close-btn {
    background: white;
    border: none;
    padding: 4px 10px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  }

  #gov-close-btn:hover {
    background: red;
    color: white;
  }

  .gov-iframe {
    flex: 1;
    width: 100%;
    border: none;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  `;

  document.head.appendChild(style);
}