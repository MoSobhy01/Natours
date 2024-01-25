export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
}

export const showAlert = (type, message, duration) => {
  hideAlert();
  const markup = `<div class= "alert alert--${type}" >${message}</div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, duration || 2000);
}