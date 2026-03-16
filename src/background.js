chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  }).then(() => {
    chrome.tabs.sendMessage(tab.id, {
      action: "TOGGLE_MODAL"
    });
  });
});
// for Token
chrome.runtime.onMessage.addListener((message) => {
  // console.log("msg", message);
  if (message.type === "PARICHAY_TOKEN") {
    console.log("TOKEN RECEIVED:", message.token);
    chrome.storage.local.set({
      gov_access_token: message.token
    });
  }
  if (message.type === "PARICHAY_LOGOUT") {
    console.log("USER LOGGED OUT");
    chrome.storage.local.remove("gov_access_token");
  }
});
