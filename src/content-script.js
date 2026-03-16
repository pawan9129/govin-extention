console.log("CONTENT SCRIPT LOADED");
function getTokenFromSession() {
  console.log("Checking login session...");
  const udetails = sessionStorage.getItem("Udetails");
  if (!udetails) {
    console.log("User not logged in");
    chrome.runtime.sendMessage({
      type: "PARICHAY_LOGOUT"
    });
    return;
  }
  try {
    const parsed = JSON.parse(udetails);
    const token = parsed?.accessToken;
    if (token) {
      console.log("TOKEN FOUND:", token);
      chrome.runtime.sendMessage({
        type: "PARICHAY_TOKEN",
        token: token
      });
    } else {
      chrome.runtime.sendMessage({
        type: "PARICHAY_LOGOUT"
      });
    }
  } catch (error) {
    console.log("Error parsing Udetails", error);
    chrome.runtime.sendMessage({
      type: "PARICHAY_LOGOUT"
    });
  }
}


// let lastToken = null;
// function getTokenFromSession() {
//   const udetails = sessionStorage.getItem("Udetails");
//   if (!udetails) {
//     if (lastToken !== null) {
//       chrome.runtime.sendMessage({
//         type: "PARICHAY_LOGOUT"
//       });
//       lastToken = null;
//     }
//     return;
//   }
//   try {
//     const parsed = JSON.parse(udetails);
//     const token = parsed?.accessToken;
//     if (token && token !== lastToken) {
//       // console.log("TOKEN FOUND:", token);
//       chrome.runtime.sendMessage({
//         type: "PARICHAY_TOKEN",
//         token: token
//       });
//       lastToken = token;
//     }
//   } catch (error) {
//     console.log("Error parsing Udetails", error);
//   }
// }

getTokenFromSession();
setInterval(() => {
  getTokenFromSession();
  // console.log("Session run");
}, 5000);

// window.addEventListener("storage", function (event) {
//   if (event.key === "Udetails") {
//     console.log("Session storage changed");
//     getTokenFromSession();
//   }
// });
