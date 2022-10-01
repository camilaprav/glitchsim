import './utils/form.js';
import App from './components/App.jsx';
import d from '@dominant/core';
window.d = d;
document.querySelector('#app-wrapper').append(window.app = <App />);
