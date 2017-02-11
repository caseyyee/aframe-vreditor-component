module.exports = {
  schema: {
    // size: { type: 'number', default: 1 }
  },

  multiple: false,

  init: function () {
  },
  update: function() {
    var el = this.el;
    var mesh = el.getObject3D('mesh');

    // add box helper
    this.helper = new THREE.BoxHelper(mesh);
    this.helper.visibe = false;
    this.el.object3D.add(this.helper);
  },

  remove: function () {
    this.helper.parent.remove(this.helper);
  }
};

