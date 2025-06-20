const apiBase = 'http://localhost:8080/api';
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showLogin = document.getElementById('show-login');
    const showRegister = document.getElementById('show-register');

    showLogin.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    showLogin.classList.add('active');
    showRegister.classList.remove('active');
});

    showRegister.addEventListener('click', () => {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    showRegister.classList.add('active');
    showLogin.classList.remove('active');
});

    loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
    const response = await fetch('http://localhost:8080/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    // credentials: "include"
});
    console.log(username)
    const data = await response.json();
    console.log(data)
    if (response.ok) {
    // Store userId and name
    localStorage.setItem('userId', data.id)
    localStorage.setItem('name', username);
    console.log('name')
    alert('Login successful!');
    window.location.href = 'dashboard.html';
} else {
    alert(data.message || 'Login failed.');
}

} catch (err) {
    console.error('Login error:', err);
    alert('Login failed. Check the console for details.');
}
});

    registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    try {
        const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password }),
});

    if (response.ok) {
      const data = await response.json();
      alert(data.message || 'Registration successful!');
    } else {
      const errorText = await response.text(); 
      console.error('Registration failed:', errorText);
      alert(errorText || 'Registration failed.');
    }
} catch (err) {
    console.error('Registration error:', err);
    alert('Registration failed. Check the console for details.');
}
});