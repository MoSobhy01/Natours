/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert'

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'post',
      url: 'http://localhost:8000/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'You logged in successfully!');
      location.assign('/')
    }
  } catch (err) {
    showAlert('error', err.response.data.message)
  }
}

export const logout = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/v1/users/logout');
    if (res.data.status === 'success') {
      showAlert('success', 'You logged out of the account!');
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response)
  }
}