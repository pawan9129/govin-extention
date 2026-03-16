
// console.log("Gov Extension Content Loaded");

// let modal = null;

// chrome.runtime.onMessage.addListener((request) => {
//   if (request.action === "TOGGLE_MODAL") {
//     toggleModal();
//   }
// });

// function toggleModal() {

//   if (modal) {
//     modal.remove();
//     modal = null;
//     return;
//   }



//   modal = document.createElement("div");
//   modal.id = "gov-modal";

//   modal.innerHTML = `
//     <div class="gov-overlay">
//       <div class="gov-modal">
//         <div class="gov-header">
//           <button id="gov-close-btn">✕</button>
//         </div>

//         <iframe src="${chrome.runtime.getURL("index.html")}" 
//                 class="gov-iframe">
//         </iframe>

//       </div>
//     </div>
//   `;

//   document.body.appendChild(modal);

//   document.getElementById("gov-close-btn").addEventListener("click", () => {
//     modal.remove();
//     modal = null;
//   });

//   addStyles();
//   const iframe = modal.querySelector(".gov-iframe");

//   if (iframe) {

//     iframe.onload = () => {

//       setTimeout(() => {

//         const emailData = extractEmailData();

//         console.log("Extracted Email Data:", emailData);

//         iframe.contentWindow.postMessage({
//           type: "EMAIL_DATA",
//           data: emailData
//         }, "*");

//       }, 500);

//     };

//   }
// }

// function extractEmailData() {

//   let subject = "";
//   let senderEmail = "";
//   let senderName = "";
//   let body = "";
//   const subjectEl = document.querySelector("h2.hP");
//   const senderEl = document.querySelector(".gD");
//   const bodyEl = document.querySelector(".a3s");
//   if (subjectEl) {
//     subject = subjectEl.innerText.trim();
//     subject = subject.replace("Invitation from an unknown sender:", "").trim();
//     if (subject.includes("@")) {
//       subject = subject.split("@")[0].trim();
//     }
//   }

//   if (senderEl) {
//     senderEmail = senderEl.getAttribute("email") || "";
//     senderName = senderEl.getAttribute("name") || "";
//   }

//   if (bodyEl) {
//     body = bodyEl.innerText.trim();
//   }

//   console.log("Clean Subject:", subject);

//   return {
//     subject,
//     senderEmail,
//     senderName,
//     body
//   };
// }

// function addStyles() {

//   if (document.getElementById("gov-styles")) return;

//   const style = document.createElement("style");
//   style.id = "gov-styles";

//   style.innerHTML = `
//   .gov-overlay {
//     position: fixed;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     background: rgba(0,0,0,0.4);
//     display: flex;
//     justify-content: flex-end;
//     z-index: 999999;
//   }

//   .gov-modal {
//     width: 420px;
//     height: 80vh;
//     background: white;
//     display: flex;
//     flex-direction: column;
//     box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
//     animation: slideIn 0.3s ease-in-out;
//   }

//   .gov-header {
//     height: 30px;
//     display: flex;
//     align-items: center;
//     justify-content: end;
//     padding: 0 15px;
//     font-weight: 600;
//   }

//   #gov-close-btn {
//     background: white;
//     border: none;
//     padding: 4px 10px;
//     font-size: 16px;
//     border-radius: 5px;
//     cursor: pointer;
//     font-weight: bold;
//   }

//   #gov-close-btn:hover {
//     background: red;
//     color: white;
//   }

//   .gov-iframe {
//     flex: 1;
//     width: 100%;
//     border: none;
//   }

//   @keyframes slideIn {
//     from { transform: translateX(100%); }
//     to { transform: translateX(0); }
//   }
//   `;

//   document.head.appendChild(style);
// }

// //   overlay.innerHTML = `
// //   <div class="gov-overlay">
// //     <div class="gov-modal">
// //       <button id="gov-close" style="
// //         position:absolute;
// //         top:10px;
// //         right:10px;
// //         z-index:10;
// //         background:#ff4d4f;
// //         color:white;
// //         border:none;
// //         padding:6px 10px;
// //         border-radius:6px;
// //         cursor:pointer;
// //       ">X</button>

// //       <iframe src="${chrome.runtime.getURL("index.html")}"
// //               style="width:100%; height:100%; border:none;">
// //       </iframe>
// //     </div>
// //   </div>
// // `;

// // setTimeout(() => {
// //   document.getElementById("gov-close").onclick = () => {
// //     document.getElementById("gov-modal").remove();
// //   };
// // }, 100);


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

  // const iframe = modal.querySelector(".gov-iframe");

  // if (iframe) {

  //   iframe.onload = () => {

  //     const emailData = extractEmailData();

  //     console.log("Extracted Email Data:", emailData);

  //     // send data to angular iframe
  //     iframe.contentWindow.postMessage({
  //       type: "EMAIL_DATA",
  //       data: emailData
  //     }, "*");

  //   };

  // }
  const iframe = modal.querySelector(".gov-iframe");
  if (iframe) {
    const emailData = extractEmailData();
    window.addEventListener("message", (event) => {
      if (event.data?.type === "ANGULAR_READY") {
        console.log("Angular ready, sending email data");
        iframe.contentWindow.postMessage({
          type: "EMAIL_DATA",
          data: emailData
        }, "*");
      }
    });
  }
}

function extractEmailData() {

  let subject = "";
  let senderEmail = "";
  let senderName = "";
  let body = "";

  const subjectEl = document.querySelector("h2.hP");
  const senderEl = document.querySelector(".gD");
  const bodyEl = document.querySelector(".a3s");

  if (subjectEl) {
    subject = subjectEl.innerText.trim();
  }

  if (senderEl) {
    senderEmail = senderEl.getAttribute("email") || "";
    senderName = senderEl.getAttribute("name") || "";
  }

  if (bodyEl) {
    body = bodyEl.innerText.trim();
  }

  return {
    subject,
    senderEmail,
    senderName,
    body
  };
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
    box-shadow: -10px 0 30px rgba(0,0,0,0.3);
  }

  .gov-header {
    height: 40px;
    display: flex;
    justify-content: end;
    align-items: center;
    padding: 10px;
  }

  #gov-close-btn {
    border: none;
    background: white;
    font-size: 18px;
    cursor: pointer;
  }

  .gov-iframe {
    flex: 1;
    width: 100%;
    border: none;
  }
  `;

  document.head.appendChild(style);

}