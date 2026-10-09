// login.js - handles login actions for examiner and aspirant
const loginExaminerBtn = document.getElementById('loginExaminerBtn');
const loginAspirantBtn = document.getElementById('loginAspirantBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');

function showError(msg){
  loginError.textContent = msg;
  setTimeout(()=>loginError.textContent='',5000);
}

async function submitLogin(role){
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if(!email || !password){ showError('Please provide email and password'); return; }

  const url = `http://localhost:5000/api/auth/login/${role}`;
  try{
    const res = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const data = await res.json();
    if(!res.ok){ showError(data.message || 'Login failed'); return; }
    // store token
    localStorage.setItem('token',data.token);
    localStorage.setItem('role',role);
    // redirect
    if(role==='examiner') location.href = 'examiner-dashboard.html';
    else location.href = 'aspirant-dashboard.html';
  }catch(err){ showError('Network error'); console.error(err); }
}

loginExaminerBtn?.addEventListener('click',()=>submitLogin('examiner'));
loginAspirantBtn?.addEventListener('click',()=>submitLogin('aspirant'));

// Also allow quick cards to navigate to login forms
document.getElementById('examinerLoginCard')?.addEventListener('click', ()=>document.getElementById('email').focus());
document.getElementById('aspirantLoginCard')?.addEventListener('click', ()=>document.getElementById('email').focus());
