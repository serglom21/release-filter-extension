// content.js
console.log("content loaded")
let officialPackageName = '';
const targetPackagePrefix = 'cool.supper.app'; // Adjust if your bogus names have a different pattern

// Function to load the official package name from storage
function loadSettings() {
  chrome.storage.local.get(['officialPackageName'], function(data) {
    officialPackageName = data.officialPackageName || 'com.example.webviewapp'; // Default value
    filterReleases();
  });
}

// Function to filter the release list
function filterReleases() {
    const releasePanels = document.querySelectorAll('[data-test-id="release-panel"]');
  
    releasePanels.forEach(panel => {
      const packageNameElement = panel.querySelector('[data-sentry-element="PackageName"]');
      if (packageNameElement) {
        const packageName = packageNameElement.textContent.trim();
        const styledPanelElement = packageNameElement.closest('[data-sentry-element="StyledPanel"]');

        if (packageName !== officialPackageName) {
          if (styledPanelElement) {
            styledPanelElement.style.display = 'none'; // Hide the irrelevant release card
          }
        } else {
          if (styledPanelElement) {
            styledPanelElement.style.display = ''; // Show relevant releases
          }
        }
      }
    });
  }

  function showAllReleases() {
    const releasePanels = document.querySelectorAll('[data-test-id="release-panel"]');
  
    releasePanels.forEach(panel => {
      const packageNameElement = panel.querySelector('[data-sentry-element="PackageName"]');
      const styledPanelElement = packageNameElement.closest('[data-sentry-element="StyledPanel"]');
      styledPanelElement.style.display = '';
    });
  }
  
  // Observe DOM changes to re-apply filtering (important for dynamic updates)
  const observer = new MutationObserver(filterReleases);
  const observerConfig = { childList: true, subtree: false }; // Only watch direct children
  
  function observeReleaseList() {
    const firstReleasePanel = document.querySelector('[data-test-id="release-panel"]');
    if (firstReleasePanel) {
      const releaseListContainer = firstReleasePanel.parentNode;
      if (releaseListContainer) {
        observer.observe(releaseListContainer, observerConfig);
        console.log('Observing release list container (parent of release-panel).');
        return true; // Successfully started observing
      } else {
        console.log('Could not find the release list container (parent of release-panel).');
      }
    } else {
      console.log('Tesdt Could not find an initial release panel to identify the container.');
    }
    return false; // Failed to start observing
  }

  function loadMessagePanel() {
    const targetElement = document.querySelector('[data-sentry-element="SystemAlerts"]');
  
    if (targetElement) {
      // Check if the warning message is already present to avoid duplicates
      const warningElement = targetElement.querySelector('.ref-warning');
      if (warningElement) {
        console.log('Warning message already exists, skipping re-injection.');
        warningElement.style.display = 'grid';
        return;
      }
  
      const htmlString = getWarningHTML(); // Get the HTML string with placeholder for package name
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlString;
  
      const injectedElement = tempDiv.firstElementChild;
  
      if (injectedElement) {
        // Apply the main styles to the injected warning container
        injectedElement.style.cssText = getWarningCSS();
  
        // Find the span that needs its text updated inside the injected element
        // We look for the <span> nested inside the <b> tag within the main span
        const packageNameSpan = injectedElement.querySelector('.app-wtourb span');
        if (packageNameSpan) {
          packageNameSpan.textContent = officialPackageName; // Dynamically set the package name
        }
  
        // Append the fully constructed and styled element to the target
        targetElement.appendChild(injectedElement);
  
        // --- Add Event Listeners to the buttons AFTER they are in the DOM ---
        const removeFilterBtn = injectedElement.querySelector('#removeFilterBtn');
        const goToReleaseDashboardBtn = injectedElement.querySelector('#goToReleaseDashboardBtn');
  
        if (removeFilterBtn) {
          removeFilterBtn.addEventListener('click', () => {
            console.log('Remove Filter button clicked!');
            showAllReleases();
            hideWarning();
          });
        }
  
        if (goToReleaseDashboardBtn) {
          goToReleaseDashboardBtn.addEventListener('click', () => {
            console.log('Go to Release Dashboard button clicked!');
            // Construct the URL to the main releases dashboard
            const releaseDashboardUrl = `https://snout-and-about.sentry.io/dashboard/133267/?release=com.example.webviewapp%401.0%2B1`;
            if (window.location.href !== releaseDashboardUrl) { // Only navigate if URL changes
              window.location.href = releaseDashboardUrl;
            }
  
            // Optionally, remove the warning message after the action
            // injectedElement.remove();
          });
        }
  
      } else {
        console.warn("No valid element found in the HTML string to inject.");
      }
    } else {
      console.warn("Target element with data-sentry-element='SystemAlerts' not found.");
    }
  }

  function hideWarning(){
    const warningElement = document.querySelector('.ref-warning');
    if (warningElement) {
      warningElement.style.display = 'none';
    }
  }
  
  function getWarningCSS() {
    return `
      display: grid;
      grid-template-columns: min-content 1fr min-content;
      gap: 8px;
      color: rgb(133, 108, 0);
      font-size: 14px;
      border-style: solid;
      border-color: rgba(235, 192, 0, 0.7);
      border-image: initial;
      padding: 12px 16px;
      background: rgba(235, 192, 0, 0.14);
      border-width: 0px 0px 1px;
      border-radius: 0px;
    `;
  }
  
  function getWarningHTML() {
    // IMPORTANT: The <span> for the package name is now a placeholder.
    // Its content will be set dynamically in loadMessagePanel.
    return `
      <div
        class="ref-warning e1b0h4f90 app-vlb65e e6x3k446"
        type="warning"
        data-sentry-element="LegacyComponent"
        data-sentry-component="ChonkSwitch"
        data-sentry-source-file="withChonk.tsx"
      >
        <div
          type="warning"
          class="e1b0h4f90 app-1ghdfll e6x3k445"
          data-sentry-element="LegacyComponent"
          data-sentry-component="ChonkSwitch"
          data-sentry-source-file="withChonk.tsx"
        >
          <svg
            role="img"
            viewBox="0 0 16 16"
            kind="path"
            data-sentry-element="svg"
            data-sentry-component="SvgIcon"
            data-sentry-source-file="svgIcon.tsx"
            fill="currentColor"
            height="14px"
            width="14px"
          >
            <path
              d="M13.87,15.26H2.13A2.1,2.07,0,0,1,0,13.16a2.07,2.07,0,0,1,.27-1L6.17,1.8a2.1,2.1,0,0,1,1.27-1,2.11,2.11,0,0,1,2.39,1L15.7,12.11a2.1,2.1,0,0,1-1.83,3.15ZM8,2.24a.44.44,0,0,0-.16,0,.58.58,0,0,0-.37.28L1.61,12.86a.52.52,0,0,0-.08.3.6.6,0,0,0,.6.6H13.87a.54.54,0,0,0,.3-.08.59.59,0,0,0,.22-.82L8.53,2.54h0a.61.61,0,0,0-.23-.22A.54.54,0,0,0,8,2.24Z"
            ></path>
            <path d="M8,10.37a.75.75,0,0,1-.75-.75V5.92a.75.75,0,0,1,1.5,0v3.7A.74.74,0,0,1,8,10.37Z"></path>
            <circle cx="8" cy="11.79" r="0.76"></circle>
          </svg>
        </div>
        <span
          data-sentry-element="LegacyComponent"
          data-sentry-source-file="withChonk.tsx"
          class="e1b0h4f90 app-wtourb e6x3k444"
          data-sentry-component="ChonkSwitch"
        >
          <b>Some releases have been hidden. Showing releases that match package name: </b>
          <span></span>
        </span>
        <div class="extension-buttons" style="grid-column: 1 / -1; display: flex; gap: 8px; margin-top: 8px;">
          <button id="removeFilterBtn" style="
            background-color: #6C5FC7;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
          ">Remove Filter</button>
          <button id="goToReleaseDashboardBtn" style="
            background-color: #3e3446;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
          ">Go to Release Dashboard</button>
        </div>
      </div>
    `;
  }

  function removeFilter(){
    console.log('removeFilter');
  }

  function checkAndApplyFilter() {
    console.log(window.location.href);
    if (window.location.href.match(/https:\/\/.*\.sentry\.io\/explore\/releases\/.*$/)) {
      console.log('Navigated to releases page (SPA navigation). Applying filter.');
      setTimeout(() => {
        filterReleases();
        loadMessagePanel();
      }, 1000);
    } else {
      console.log('Not a releases page. Skipping filter.');
      hideWarning();
    }
  }
  
    window.navigation.addEventListener("navigate", (event) => {
        console.log('location changed!');
        setTimeout(() => {
          checkAndApplyFilter();
        }, 1000)
        
    })
  // Initial load of settings and filtering
  setTimeout(() => {
    // Try to observe the release list periodically in case it loads after the initial script execution
    // Initial check when the script is loaded (for the first visit or a full page reload)

    observeReleaseList();
    loadSettings();
    loadMessagePanel();
  },2000)
