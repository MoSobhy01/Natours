import axios from "axios";
import { showAlert } from './alert'

export const updateData = async function (data) {
  try {
    const updatedUser = await axios({
      method: 'Patch',
      url: 'http://localhost:8000/api/v1/users/me',
      data
    });
    showAlert('success', 'Your data has been updated successfully!');
    document.querySelector('.form__user-photo').src = `img/users/${updatedUser.data.data.user.photo}`;
    document.querySelector('.nav__user-img').src = `img/users/${updatedUser.data.data.user.photo}`;
  } catch (err) {
    let message = '';
    if (err.response.data.message.includes('email')) message += 'Invalid Email Address, Please enter a valid email address';
    if (err.response.data.message.includes('name')) message += '</br>Invalid Name. Names must be larger than 8 characters'
    message = message || err.response.data.message;
    showAlert('error', message, 4000);
  }
};