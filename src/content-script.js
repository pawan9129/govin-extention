// content-script.ts
// (() => {
//   const originalFetch = window.fetch.bind(window);
//   window.fetch = async function (
//     input: RequestInfo | URL,
//     init?: RequestInit
//   ): Promise<Response> {
//     const response = await originalFetch(input, init);
//     const url = typeof input === 'string' ? input : input.toString();
//     if (url.includes('/meityapis/auth/parichay_handshake')) {
//       const cloned = response.clone();
//       cloned.json()
//         .then((data) => {
//           if (data?.accessToken) {
//             chrome.storage.local.set({ parichayToken: data.accessToken }, () => {
//               console.log('✅ Parichay token stored in extension:', data.accessToken);
//             });
//           }
//         })
//         .catch(err => console.error('Failed to parse handshake response:', err));
//     }
//     return response;
//   };
// })();
console.log("CONTENT SCRIPT LOADED");
console.log("Interceptor Loaded");
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  debugger
  const response = await originalFetch.apply(this, args);
  const url = args[0].toString();
  if (url.includes("parichay_handshake")) {
    console.log("console1")
    const clone = response.clone();
    clone.json().then((data)=>{
      console.log("FETCH RESPONSE:", data);
      if(data?.data?.accessToken){
          console.log("console 2")
        chrome.runtime.sendMessage({
          type:"PARICHAY_TOKEN",
          token:data.data.accessToken
        });
      }
    });
  }
  return response;
};

const open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function () {
  this.addEventListener("load", function () {
    if (this.responseURL.includes("parichay_handshake")) {
      try {
          console.log("console 3")
        const data = JSON.parse(this.responseText);
        console.log("XHR RESPONSE:??>>>>", data);
        if(data?.data?.accessToken){
          chrome.runtime.sendMessage({
            type:"PARICHAY_TOKEN",
            token:data.data.accessToken
          });
        }
      } catch(e){
        console.log(e)
      }
    }
  });
  open.apply(this, arguments);
};