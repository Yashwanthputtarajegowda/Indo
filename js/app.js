const loginForm = document.querySelector('#login-form');
const createAccount = document.querySelector('#create-account');
const authMessage = document.querySelector('#auth-message');

loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    authMessage.textContent = 'Login connection will be added in the next step.';
});

createAccount?.addEventListener('click', () => {
    authMessage.textContent = 'Account creation will be added in the next step.';
});
