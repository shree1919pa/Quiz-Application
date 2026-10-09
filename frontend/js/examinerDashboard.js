// examinerDashboard.js
const examinerNameEl = document.getElementById('examinerName');
const logoutBtn = document.getElementById('logoutBtn');
const dashLogout = document.getElementById('dashLogout');

function getProfile(){
  // for demo, try to decode token or fetch profile
  const token = localStorage.getItem('token');
  if(!token){ location.href='login.html'; return; }
  // naive decode to show name if token contains a name field in payload (base64)
  try{
    const parts = token.split('.');
    if(parts.length>1){
      const payload = JSON.parse(atob(parts[1]));
      examinerNameEl.textContent = payload.fullName || payload.name || 'Examiner';
    }
  }catch(e){ console.warn('Cannot decode token',e); }
}

function logout(){ localStorage.removeItem('token'); localStorage.removeItem('role'); location.href='login.html'; }

logoutBtn?.addEventListener('click',logout);
dashLogout?.addEventListener('click',logout);

getProfile();
