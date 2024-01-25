/* eslint-disable */
import '@babel/polyfill'
import { login, logout } from './login'
import { displayMap } from './mapbox'
import { updateData } from './updateUserData'
import { updatePassword } from './updatePassword'

const mapbox = document.getElementById('map');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateSettings = document.querySelector('.btn--saveSettings');
const uploadInput = document.querySelector('.form__upload');

if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.location);
  displayMap(locations);
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  })
}

if (uploadInput) {
  uploadInput.addEventListener('input', (file) => {
    var input = file.target;
    var reader = new FileReader();
    reader.onload = function () {
      var dataURL = reader.result;
      var output = document.querySelector('.form__user-photo');
      output.src = dataURL;
    };
    reader.readAsDataURL(input.files[0]);
  })
}

if (updateSettings) {
  updateSettings.addEventListener('click', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('photo', document.getElementById('photo').files[0])
    updateData(form);
  });
}

const passswordForm = document.querySelector('.form-user-settings');
if (passswordForm) {
  passswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const curPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm = document.getElementById('password-confirm').value;
    const btn = document.querySelector('.btn--save-password');
    btn.textContent = 'Loading...';
    btn.disabled = true;

    await updatePassword(curPassword, newPassword, newPasswordConfirm);

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    btn.textContent = 'Save Password';
    btn.disabled = false;
  })
}


const loginForm = document.querySelector('.form--login');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
