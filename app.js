const API = 'https://syntaip-production.up.railway.app';
const statusEl = document.getElementById('status');
const token = new URLSearchParams(location.search).get('t');
function show(message, type=''){statusEl.textContent=message;statusEl.className='status '+type;}
(async()=>{
  if(!token){show('This link is missing its unique test code. Ask the person who shared it for a valid link.','error');return;}
  try{
    const response=await fetch(`${API}/api/visit`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||'Unable to record this visit.');
    show('Thanks! Your test visit was recorded. You can safely close this page.','success');
  }catch(error){show(error.message||'The service is temporarily unavailable.','error');}
})();
