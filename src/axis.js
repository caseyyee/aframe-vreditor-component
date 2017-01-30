module.exports = {
  schema: {
    size: { type: 'number', default: 1 }
  },
  init: function () {
    var axisHelper = new THREE.AxisHelper( this.data.size );
    this.el.object3D.add(axisHelper);
  }
};

