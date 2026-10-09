// aspirantDashboard.js
const aspirantNameEl = document.getElementById('aspirantName');
const logoutBtn = document.getElementById('logoutBtn');
const dashLogout = document.getElementById('dashLogout');

function getProfile(){
  const token = localStorage.getItem('token');
  if(!token){ location.href='login.html'; return; }
  try{
    const parts = token.split('.');
    if(parts.length>1){
      const payload = JSON.parse(atob(parts[1]));
      aspirantNameEl.textContent = payload.fullName || payload.name || 'Aspirant';
    }
  }catch(e){ console.warn('Cannot decode token',e); }
}

function logout(){ localStorage.removeItem('token'); localStorage.removeItem('role'); location.href='login.html'; }

logoutBtn?.addEventListener('click',logout);
dashLogout?.addEventListener('click',logout);

getProfile();
