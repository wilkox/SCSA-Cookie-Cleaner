document.addEventListener('DOMContentLoaded', function() {
  const clearButton = document.getElementById('clearButton');
  const statusDiv = document.getElementById('status');
  
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
  
  clearButton.addEventListener('click', function() {
    // Set button to "fixing" state
    setButtonState('fixing', 'Fixing...', true);
    showStatus('Checking cookies...', 'status-info');
    
    // Remove all cookies from the b2clogin.com domain
    chrome.cookies.getAll({ domain: 'b2clogin.com' }, function(cookies) {
      if (cookies.length === 0) {
        // No cookies found
        setButtonState('success', 'No cookies found', false);
        showStatus('Already clean - try refreshing SCSA', 'status-info');
        
        // Reset after 3 seconds
        setTimeout(() => {
          setButtonState('', 'Fix SCSA', false);
          showStatus('', '');
        }, 3000);
        return;
      }
      
      showStatus(`Removing ${cookies.length} cookies...`, 'status-info');
      
      let cookiesDeleted = 0;
      let cookiesProcessed = 0;
      
      // Process each cookie
      for (let cookie of cookies) {
        const url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
        
        chrome.cookies.remove({
          url: url,
          name: cookie.name
        }, function(details) {
          cookiesProcessed++;
          
          // Count successful deletions
          if (details) {
            cookiesDeleted++;
          }
          
          // Check if all cookies have been processed
          if (cookiesProcessed === cookies.length) {
            // All done - show success state
            if (cookiesDeleted > 0) {
              setButtonState('success', 'Fixed!', false);
              showStatus(`Cleared ${cookiesDeleted} cookies - refresh SCSA`, 'status-success');
            } else {
              setButtonState('', 'Fix SCSA', false);
              showStatus('Unable to clear cookies', 'status-info');
            }
            
            // Reset button after 4 seconds
            setTimeout(() => {
              setButtonState('', 'Fix SCSA', false);
              showStatus('', '');
            }, 4000);
          }
        });
      }
    });
  });
  
  // Check initial cookie count on popup open (optional feedback)
  chrome.cookies.getAll({ domain: 'b2clogin.com' }, function(cookies) {
    if (cookies.length > 0) {
      showStatus(`${cookies.length} cookies detected`, 'status-info');
      setTimeout(() => {
        if (statusDiv.textContent.includes('detected')) {
          showStatus('', '');
        }
      }, 2500);
    }
  });
});
