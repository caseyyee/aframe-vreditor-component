module.exports = {
  init: function () {
    var helper = new THREE.BoxHelper(this.el.getObject3D('mesh'));
    this.el.object3D.add(helper);
  }
};

