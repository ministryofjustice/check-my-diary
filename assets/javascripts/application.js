(function (window) {

  document.body.className += ' ' + 'js-enabled';
  window.GOVUKFrontend.initAll();

  window.addEventListener('load', () => {
    registerSW();
  });

  async function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/public/service-worker.js')
        .then(function (registration) {
          console.log('Service Worker registration successful with scope: ', registration.scope);
        })
        .catch(function (err) {
          console.log('Service Worker registration failed: ', err);
        });
    }
  }

})(window);
