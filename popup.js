document.addEventListener('DOMContentLoaded', function() {
  const clearButton = document.getElementById('clearButton');
  const statusDiv = document.getElementById('status');
  
  // Domains to clear cookies from
  const domains = ['b2clogin.com', 'scriptcheck.sa.gov.au'];
  
  // Button state management
  function setButtonState(state, text, disabled = false) {
    clearButton.disabled = disabled;
    clearButton.className = state;
    
    if (state === 'fixing') {
      clearButton.innerHTML = '<span class="spinner"></span>' + text;
    } else {
      clearButton.textContent = text;
    }
  }
  
  function showStatus(message, className) {
    statusDiv.textContent = message;
    statusDiv.className = className;
  }
  
  // Function to clear cookies for a specific domain
  function clearCookiesForDomain(domain) {
    return new Promise((resolve) => {
      chrome.cookies.getAll({ domain: domain }, function(cookies) {
        if (cookies.length === 0) {
          resolve({ domain, cookiesFound: 0, cookiesDeleted: 0 });
          return;
        }
        
        let cookiesDeleted = 0;
        let cookiesProcessed = 0;
        
        for (let cookie of cookies) {
          const url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
          
          chrome.cookies.remove({
            url: url,
            name: cookie.name
          }, function(details) {
            cookiesProcessed++;
            
            if (details) {
              cookiesDeleted++;
            }
            
            if (cookiesProcessed === cookies.length) {
              resolve({ domain, cookiesFound: cookies.length, cookiesDeleted });
            }
          });
        }
      });
    });
  }
  
  clearButton.addEventListener('click', async function() {
    // Set button to "fixing" state
    setButtonState('fixing', 'Fixing...', true);
    showStatus('Checking cookies...', 'status-info');
    
    try {
      // Clear cookies for all domains
      const results = await Promise.all(domains.map(clearCookiesForDomain));
      
      // Calculate totals
      const totalFound = results.reduce((sum, result) => sum + result.cookiesFound, 0);
      const totalDeleted = results.reduce((sum, result) => sum + result.cookiesDeleted, 0);
      
      // Show results
      if (totalFound === 0) {
        setButtonState('success', 'No cookies found', false);
        showStatus('Already clean - try refreshing SCSA', 'status-info');
      } else if (totalDeleted > 0) {
        setButtonState('success', 'Fixed!', false);
        showStatus(`Cleared ${totalDeleted} cookies - refresh SCSA`, 'status-success');
      } else {
        setButtonState('', 'Fix SCSA', false);
        showStatus('Unable to clear cookies', 'status-info');
      }
      
      // Reset button after 4 seconds
      setTimeout(() => {
        setButtonState('', 'Fix SCSA', false);
        showStatus('', '');
      }, 4000);
      
    } catch (error) {
      console.error('Error clearing cookies:', error);
      setButtonState('', 'Fix SCSA', false);
      showStatus('Error occurred', 'status-info');
    }
  });
  
  // Check initial cookie count on popup open (optional feedback)
  async function checkInitialCookies() {
    try {
      const results = await Promise.all(domains.map(domain => 
        new Promise(resolve => {
          chrome.cookies.getAll({ domain }, cookies => {
            resolve({ domain, count: cookies.length });
          });
        })
      ));
      
      const totalCookies = results.reduce((sum, result) => sum + result.count, 0);
      
      if (totalCookies > 0) {
        showStatus(`${totalCookies} cookies detected`, 'status-info');
        setTimeout(() => {
          if (statusDiv.textContent.includes('detected')) {
            showStatus('', '');
          }
        }, 2500);
      }
    } catch (error) {
      console.error('Error checking initial cookies:', error);
    }
  }
  
  checkInitialCookies();
});
