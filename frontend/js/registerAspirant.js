// registerAspirant.js
const regBtn = document.getElementById('registerBtn');
const regFull = document.getElementById('fullName');
const regEmail = document.getElementById('email');
const regPass = document.getElementById('password');
const regConfirm = document.getElementById('confirmPassword');
const regError = document.getElementById('regError');
const regSuccess = document.getElementById('regSuccess');

function show(err){ regError.textContent = err; setTimeout(()=>regError.textContent='',5000); }
function success(msg){ regSuccess.textContent = msg; setTimeout(()=>regSuccess.textContent='',5000); }

async function register(){
  const fullName = regFull.value.trim();
  const email = regEmail.value.trim();
  const password = regPass.value;
  const confirm = regConfirm.value;
  if(!fullName || !email || !password || !confirm) return show('Please fill all fields');
  if(password.length < 6) return show('Password must be at least 6 characters');
  if(password !== confirm) return show('Passwords do not match');

  try{
    const res = await fetch('http://localhost:5000/api/auth/register/aspirant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fullName,email,password})});
    const data = await res.json();
    if(!res.ok) return show(data.message || 'Registration failed');
    success('Registered successfully. Redirecting to login...');
    setTimeout(()=>location.href='login.html',1200);
  }catch(err){ show('Network error'); console.error(err); }
}

regBtn?.addEventListener('click',register);
