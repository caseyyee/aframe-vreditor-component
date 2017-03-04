module.exports = {
  schema: {type: 'array'},

  update: function () {
    var object3D = this.el.object3D;
    var data = this.data;
    object3D.matrix.fromArray(data);
  }
};
