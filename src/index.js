import init from './main.js';
import Layout from './utils/Layout.js';


//----------------------------------------------------------------------------------------------------------------------
function environmentReady() {
    window.removeEventListener('load', environmentReady);
    initListeners();
    init();
}

function initListeners() {
    window.addEventListener("resize", Layout.fitLayout);
    setInterval(Layout.fitLayout, 100); // must have on slow devices
}

//----------------------------------------------------------------------------------------------------------------------
window.addEventListener('load', environmentReady);