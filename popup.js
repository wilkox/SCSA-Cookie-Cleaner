document.addEventListener('DOMContentLoaded', function() {
  const clearButton = document.getElementById('clearButton');
  const statusDiv = document.getElementById('status');
  
  // Domains to clear cookies from and refresh tabs for
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
  
  // Function to find tabs that match our target domains
  function findRelevantTabs() {
    return new Promise((resolve) => {
      chrome.tabs.query({}, function(tabs) {
        const relevantTabs = tabs.filter(tab => {
          if (!tab.url) return false;
          try {
            const url = new URL(tab.url);
            return domains.some(domain => 
              url.hostname === domain || url.hostname.endsWith('.' + domain)
            );
          } catch {
            return false;
          }
        });
        resolve(relevantTabs);
      });
    });
  }
  
  // Function to refresh tabs
  function refreshTabs(tabs) {
    return new Promise((resolve) => {
      if (tabs.length === 0) {
        resolve();
        return;
      }
      
      let refreshed = 0;
      tabs.forEach(tab => {
        chrome.tabs.reload(tab.id, {}, function() {
          refreshed++;
          if (refreshed === tabs.length) {
            resolve();
          }
        });
      });
    });
  }
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
    showStatus('Finding relevant tabs...', 'status-info');
    
    try {
      // First, find any open tabs for our target domains
      const relevantTabs = await findRelevantTabs();
      
      // Update status based on what we found
      if (relevantTabs.length > 0) {
        showStatus(`Found ${relevantTabs.length} tab(s), clearing cookies...`, 'status-info');
      } else {
        showStatus('Checking cookies...', 'status-info');
      }
      
      // Clear cookies for all domains
      const results = await Promise.all(domains.map(clearCookiesForDomain));
      
      // Calculate totals
      const totalFound = results.reduce((sum, result) => sum + result.cookiesFound, 0);
      const totalDeleted = results.reduce((sum, result) => sum + result.cookiesDeleted, 0);
      
      // If we have tabs to refresh and cookies were cleared, refresh them
      if (relevantTabs.length > 0 && totalDeleted > 0) {
        showStatus(`Refreshing ${relevantTabs.length} tab(s)...`, 'status-info');
        await refreshTabs(relevantTabs);
      }
      
      // Show final results
      if (totalFound === 0) {
        setButtonState('success', 'No cookies found', false);
        if (relevantTabs.length > 0) {
          showStatus(`No cookies found - tabs refreshed anyway`, 'status-info');
        } else {
          showStatus('Already clean - try refreshing SCSA', 'status-info');
        }
      } else if (totalDeleted > 0) {
        setButtonState('success', 'Fixed!', false);
        if (relevantTabs.length > 0) {
          showStatus(`Cleared ${totalDeleted} cookies & refreshed tabs`, 'status-success');
        } else {
          showStatus(`Cleared ${totalDeleted} cookies - refresh SCSA`, 'status-success');
        }
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
      console.error('Error during fix process:', error);
      setButtonState('', 'Fix SCSA', false);
      showStatus('Error occurred', 'status-info');
    }
  });
  
  // Check initial state on popup open
  async function checkInitialState() {
    try {
      // Check for relevant tabs
      const relevantTabs = await findRelevantTabs();
      
      // Check for cookies
      const results = await Promise.all(domains.map(domain => 
        new Promise(resolve => {
          chrome.cookies.getAll({ domain }, cookies => {
            resolve({ domain, count: cookies.length });
          });
        })
      ));
      
      const totalCookies = results.reduce((sum, result) => sum + result.count, 0);
      
      // Show status based on what we found
      if (relevantTabs.length > 0 && totalCookies > 0) {
        showStatus(`${totalCookies} cookies, ${relevantTabs.length} tab(s) open`, 'status-info');
      } else if (relevantTabs.length > 0) {
        showStatus(`${relevantTabs.length} SCSA tab(s) open`, 'status-info');
      } else if (totalCookies > 0) {
        showStatus(`${totalCookies} cookies detected`, 'status-info');
      }
      
      // Clear status after a delay if it's still showing the initial check
      setTimeout(() => {
        if (statusDiv.textContent.includes('detected') || 
            statusDiv.textContent.includes('open') || 
            statusDiv.textContent.includes('cookies,')) {
          showStatus('', '');
        }
      }, 3000);
    } catch (error) {
      console.error('Error checking initial state:', error);
    }
  }
  
  checkInitialState();
});
