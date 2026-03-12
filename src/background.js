// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["content.js"]
//   }).then(() => {
//     chrome.tabs.sendMessage(tab.id, {
//       action: "TOGGLE_MODAL"
//     });
//   });
// });

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

chrome.runtime.onMessage.addListener((message) => {
  console.log("MESSAGE RECEIVED:", message);
  if (message.type === "PARICHAY_TOKEN") {
    chrome.storage.local.set({
      parichayToken: message.token
    });
    console.log("TOKEN SAVED:", message.token);
  }
});

