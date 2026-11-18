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
    if (!('geolocation' in navigator)) {
      resolve({ browser_location_status: 'unsupported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => resolve({
        browser_latitude: position.coords.latitude,
        browser_longitude: position.coords.longitude,
        browser_accuracy: position.coords.accuracy,
        browser_location_status: 'granted'
      }),
      error => {
        const status = error.code === error.PERMISSION_DENIED ? 'denied'
          : error.code === error.TIMEOUT ? 'timeout' : 'unavailable';
        resolve({ browser_location_status: status });
      },
      { enableHighAccuracy: true, timeout: 18000, maximumAge: 0 }
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
    setModalState('Waiting for your browser', 'Your browser should now ask whether Tracepoint can access your device location. Choose Allow only if you want to share it.');
    const locationData = await requestBrowserLocation();

    if (locationData.browser_location_status === 'granted') {
      setModalState('Location received', 'Thanks! Your device shared its location. We are securely recording the test result.', 'done');
    } else if (locationData.browser_location_status === 'denied') {
      setModalState('Permission not granted', 'No precise location was shared. The test will continue using approximate IP-based location only.', 'error');
    } else {
      setModalState('Using approximate location', 'Precise location was unavailable. The test will continue using approximate IP-based location only.');
    }

    try {
      await recordVisit(locationData);
      modal.classList.add('hidden');
      showStatus(
        locationData.browser_location_status === 'granted'
          ? 'Your test visit was recorded with the location you approved. You can safely close this page.'
          : 'Your test visit was recorded using approximate IP-based location. You can safely close this page.',
        'success'
      );
    } catch (error) {
      modal.classList.add('hidden');
      showStatus(error.message || 'The service is temporarily unavailable.', 'error');
    }
  }, 900);
})();
