console.log("CONTENT SCRIPT LOADED");

let lastToken = null;
let failCount = 0;
const MAX_FAIL = 6;
let logoutSent = false;
let checkTimeout = null;

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp; // seconds
    const now = Math.floor(Date.now() / 1000);

    return exp < now;
  } catch (e) {
    console.log("Invalid token");
    return true;
  }
}

function scheduleCheck(delay = 500) {
  if (checkTimeout) clearTimeout(checkTimeout);

  checkTimeout = setTimeout(() => {
    getTokenFromSession();
  }, delay);
}


function getTokenFromSession() {
  try {
    const udetails = sessionStorage.getItem("Udetails");
    if (!udetails) {
      failCount++;
      // console.log("⏳ Waiting session...", failCount);
      if (failCount >= MAX_FAIL && !logoutSent) {
        console.log("🚪 Confirm logout (session missing)");
        logoutSent = true;
        chrome.runtime.sendMessage({
          type: "PARICHAY_LOGOUT"
        });
      }

      return;
    }

    failCount = 0;
    logoutSent = false;
    const parsed = JSON.parse(udetails);
    const token = parsed?.accessToken;
    if (!token) return;
    if (isTokenExpired(token)) {
      console.log("❌ Token expired → logout");
      if (!logoutSent) {
        logoutSent = true;
        chrome.runtime.sendMessage({
          type: "PARICHAY_LOGOUT"
        });
      }
      return;
    }

    if (token !== lastToken) {
      lastToken = token;
      console.log("✅ LOGIN DETECTED");
      chrome.runtime.sendMessage({
        type: "PARICHAY_TOKEN",
        token: token
      });
    }
  } catch (error) {
    console.log("Error parsing session", error);
  }
}
window.addEventListener("load", () => {
  scheduleCheck(1500);
});

window.addEventListener("focus", () => {
  scheduleCheck(500);
});

window.addEventListener("storage", (event) => {
  if (event.key === "Udetails") {
    scheduleCheck(300);
  }
});

setInterval(() => {
  scheduleCheck(1000);
}, 8000);

// console.log("CONTENT SCRIPT LOADED");
// function getTokenFromSession() {
//   console.log("Checking login session...");
//   const udetails = sessionStorage.getItem("Udetails");
//   if (!udetails) {
//     console.log("User not logged in");
//     chrome.runtime.sendMessage({
//       type: "PARICHAY_LOGOUT"
//     });
//     return;
//   }
//   try {
//     const parsed = JSON.parse(udetails);
//     const token = parsed?.accessToken;
//     if (token) {
//       console.log("TOKEN FOUND:", token);
//       chrome.runtime.sendMessage({
//         type: "PARICHAY_TOKEN",
//         token: token
//       });
//     } else {
//       chrome.runtime.sendMessage({
//         type: "PARICHAY_LOGOUT"
//       });
//     }
//   } catch (error) {
//     console.log("Error parsing Udetails", error);
//     chrome.runtime.sendMessage({
//       type: "PARICHAY_LOGOUT"
//     });
//   }
// }
// getTokenFromSession();
// setInterval(() => {
//   getTokenFromSession();
//   // console.log("Session run");
// }, 5000);

// window.addEventListener("storage", function (event) {
//   if (event.key === "Udetails") {
//     console.log("Session storage changed");
//     getTokenFromSession();
//   }
// });
