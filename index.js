require('aframe-dev-components');

window.AFRAME = require('aframe');

AFRAME.registerComponent('matrix', require('./src/matrix'));
AFRAME.registerComponent('edit', require('./src/edit'));
