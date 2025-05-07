document.addEventListener('DOMContentLoaded', function() {
  const clearButton = document.getElementById('clearButton');
  const statusDiv = document.getElementById('status');
  
  clearButton.addEventListener('click', function() {
    // Remove all cookies from the b2clogin.com domain
    chrome.cookies.getAll({ domain: 'b2clogin.com' }, function(cookies) {
      if (cookies.length === 0) {
        statusDiv.textContent = 'No cookies found';
        setTimeout(() => { statusDiv.textContent = ''; }, 3000);
        return;
      }
      
      let cookiesDeleted = 0;
      
      for (let cookie of cookies) {
        const url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
        
        chrome.cookies.remove({
          url: url,
          name: cookie.name
        }, function() {
          cookiesDeleted++;
          if (cookiesDeleted === cookies.length) {
            statusDiv.textContent = `Deleted ${cookiesDeleted} cookies`;
            setTimeout(() => { statusDiv.textContent = ''; }, 3000);
          }
        });
      }
    });
  });
});