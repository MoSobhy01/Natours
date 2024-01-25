import axios from "axios";
import { showAlert } from './alert'

export const updatePassword = async function (currentPassword, newPassword, newPasswordConfirm) {
  try {
    const updatedUser = await axios({
      method: 'Patch',
      url: 'http://localhost:8000/api/v1/users/updatePassword',
      data: { currentPassword, newPassword, newPasswordConfirm }
    });
    showAlert('success', 'Your passsword has been updated successfully!');
  } catch (err) {
    let message = '';
    if (err.response.data.message.includes('current password')) message += 'Current Password is not correct'
    if (err.response.data.message.includes('passwordConfirm:')) message += 'Passwords must be matched';
    message = message || err.response.data.message;
    showAlert('error', message, 4000);
  }
}; 