console.log("CONTENT SCRIPT LOADED");

let lastToken = null;
let failCount = 0;
const MAX_FAIL = 3;

function getTokenFromSession() {
  try {
    const udetails = sessionStorage.getItem("Udetails");

    if (!udetails) {
      failCount++;
      console.log("Udetails not found, failCount:", failCount);

      if (failCount >= MAX_FAIL) {
        console.log("User probably logged out");
        chrome.runtime.sendMessage({
          type: "PARICHAY_LOGOUT"
        });
      }

      return;
    }

    failCount = 0;
    const parsed = JSON.parse(udetails);
    const token = parsed?.accessToken;
    if (!token) return;
    if (token !== lastToken) {
      lastToken = token;
      console.log("✅ TOKEN FOUND:", token);
      chrome.runtime.sendMessage({
        type: "PARICHAY_TOKEN",
        token: token
      });
    }
  } catch (error) {
    console.log("Error parsing session", error);
  }
}


setTimeout(getTokenFromSession, 1000);

window.addEventListener("focus", () => {
  console.log("Tab focused → checking token");
  getTokenFromSession();
});

document.addEventListener("click", () => {
  getTokenFromSession();
});

setInterval(() => {
  getTokenFromSession();
}, 15000); // every 15 sec (safe)



window.addEventListener("storage", (event) => {
  if (event.key === "Udetails") {
    console.log("Session storage changed");
    getTokenFromSession();
  }
});




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
