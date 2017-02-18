window.AFRAME = require('aframe');

AFRAME.registerComponent('retain-camera', require('./src/retain-camera'));

AFRAME.registerComponent('axis', require('./src/axis'));

AFRAME.registerComponent('bb', require('./src/bounding-box'));

AFRAME.registerComponent('controllable', require('./src/controllable'));

AFRAME.registerComponent('selected', require('./src/selected'));

AFRAME.registerComponent('cloneable', require('./src/cloneable'));

AFRAME.registerComponent('scale-axis', require('./src/scale-axis'));
