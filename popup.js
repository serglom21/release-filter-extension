// popup.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("popup loaded")
    const latestReleaseValueInput = document.getElementById('latestReleaseValue');
    const applyFilterButton = document.getElementById('applyFilter');
  
    // **Helper Functions:**
  
    /**
     * Extracts the project ID from the URL of the currently active tab.
     * @returns {Promise<string|null>} A promise that resolves with the project ID or null if not found.
     */
    async function getProjectIdFromActiveTab() {
      return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0] && tabs[0].url) {
            const url = new URL(tabs[0].url);
            const projectId = url.searchParams.get('project');
            if (projectId) {
              resolve(projectId);
            } else {
              reject('Could not find project ID in URL.');
            }
          } else {
            reject('Could not get active tab URL.');
          }
        });
      });
    }
  
    /**
     * Fetches releases from the Sentry API for a given project.
     * @param {string} projectId The Sentry project ID.
     * @param {string} apiUrl The Sentry API URL (e.g., 'https://your-sentry.io').
     * @param {string} apiKey The Sentry API key.
     * @returns {Promise<Array|null>} A promise that resolves with an array of release objects or null on error.
     */
    async function fetchSentryReleases(projectId, apiUrl, apiKey) {
      if (!projectId) {
        console.error('Project ID is missing.');
        return null;
      }
      if (!apiKey) {
        console.warn('Sentry API key is missing. API request may fail.');
        // In a real-world scenario, you would prompt the user to enter an API key
        // and store it securely using chrome.storage.local.set
        return null;
      }
  
      const releasesEndpoint = `${apiUrl}/api/0/projects/team-se/${projectId}/releases/?adoptionStages=1&flatten=0&per_page=100&status=open&summaryStatsPeriod=30d`; // Adjust per_page as needed
  
      try {
        const response = await fetch(releasesEndpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch Sentry releases:', response.status, errorText);
          return null; // Return null to indicate an error
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching Sentry releases:', error);
        return null; // Return null to indicate an error
      }
    }
  
    /**
     * Compares two semantic version strings.
     * Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal, uses string comparison if not valid semver.
     */
    function compareVersions(v1, v2) {
        const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
        const p1 = v1.match(semverRegex);
        const p2 = v2.match(semverRegex);
  
        if (!p1 || !p2) {
            // If not valid semver, compare as strings
            return v1.localeCompare(v2);
        }
  
        for (let i = 1; i < 4; i++) {
            const n1 = parseInt(p1[i]) || 0;
            const n2 = parseInt(p2[i]) || 0;
            if (n1 < n2) return -1;
            if (n1 > n2) return 1;
        }
  
        if (p1[4] && !p2[4]) return -1;
        if (!p1[4] && p2[4]) return 1;
        if (p1[4] && p2[4]) {
          if (p1[4] < p2[4]) return -1;
          if (p1[4] > p2[4]) return 1;
        }
        return 0; // Versions are equal
    }
  
    /**
     * Finds the latest release with the specified official package.
     * @param {Array} releases An array of release objects from the Sentry API.
     * @param {string} officialPackage The official package name to filter by.
     * @returns {string|null} The version string of the latest official release, or null if not found.
     */
    function findLatestOfficialRelease(releases, officialPackage) {
      if (!releases || releases.length === 0 || !officialPackage) {
        return null;
      }
  
      let latestRelease = null;
      let latestVersion = null;
  
      for (const release of releases) {
        if (release.versionInfo && release.versionInfo[officialPackage]) {
          if (!latestRelease || compareVersions(release.version, latestVersion) > 0) {
            latestRelease = release;
            latestVersion = release.version;
          }
        }
      }
  
      return latestVersion;
    }
  
    // **Main Function:**
  
    /**
     * Fetches releases from the Sentry API and populates the "Latest Release" input field.
     */
    async function populateLatestRelease() {
      try {
        const projectId = await getProjectIdFromActiveTab();
        const apiUrl = 'https://team-se.sentry.io'; // Replace with your Sentry instance URL
        const officialPackage = 'cool.super.app'; // Replace with your official package name
        const apiKey = await new Promise(resolve => {
          chrome.storage.local.get(['sentryApiKey'], data => {
            resolve(data.sentryApiKey);
          });
        });
  
        if (projectId) {
          const releases = await fetchSentryReleases(projectId, apiUrl, apiKey);
          if (releases) {
            const latestOfficialVersion = findLatestOfficialRelease(releases, officialPackage);
            if (latestOfficialVersion) {
              latestReleaseValueInput.value = latestOfficialVersion;
            } else {
              latestReleaseValueInput.placeholder = 'No official releases found.';
            }
          } else {
            latestReleaseValueInput.placeholder = 'Failed to fetch releases.'; // Set placeholder for error
          }
        }
      } catch (error) {
        console.error('Error in populateLatestRelease:', error);
        latestReleaseValueInput.placeholder = 'Error: ' + error.message; // Show error to user
      }
    }
  
    // **Event Listeners:**
  
    // Call the main function when the popup loads
    populateLatestRelease();
  
    // Event listener for saving settings (you'll need to implement this)
    applyFilterButton.addEventListener('click', () => {
      const latestReleaseValue = latestReleaseValueInput.value;
      const filterLatest = document.getElementById('filterLatestCheckbox').checked;
  
      chrome.storage.local.set({ latestReleaseValue, filterLatest }, () => {
        console.log('Settings saved');
        // Optionally send a message to the content script to update its filtering behavior
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateSettings',
              latestReleaseValue,
              filterLatest,
            });
          }
        });
      });
    });
  });
  