# transaction-tracker
An online/offline Progressive Web App that tracks account balance, withdrawals, and deposits. It can be downloaded and used online or offline due to the inclusion of an app manifest and service worker. Data entered in offline mode is stored client-side in IndexedDB, then stored server-side in MongoDB once online again. The app also uses compression to optimize performance.
