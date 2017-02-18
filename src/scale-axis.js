module.exports = {
  schema: {
    // size: { type: 'number', default: 1 }
  },

  multiple: false,

  init: function () {
    var self = this;

    this.controllers = [{
      // el: document.querySelector('a-entity[hand-controls="left"]'),
      el: document.querySelector('#left'),
      lastPosition: [0, 0, 0],
      delta: [0,0,0],
      axis: 0
    }, {
      // el: document.querySelector('a-entity[hand-controls="right"]'),
      el: document.querySelector('#right'),
      lastPosition: [0, 0, 0],
      delta: [0,0,0],
      axis: 0
    }]

    this.target = document.querySelector('#target');
  },

  tick: function () {
    function findMovementAxis (arr) {
      var maxIndex = 0;
      for (var i = 0; i < arr.length; i++) {
        if (Math.abs(arr[maxIndex]) < Math.abs(arr[i])) {
          maxIndex = i;
        }
      }
      return maxIndex;
    }

    this.controllers.forEach(function (controller) {
      var position = controller.el.getAttribute('position');
      var lastPosition = controller.lastPosition;
      var positionChange = [position.x - lastPosition[0],
        position.y - lastPosition[1],
        position.z - lastPosition[2]];

      // 0: x, 1: y, 2: z
      var axis = findMovementAxis(positionChange);
      controller.delta = positionChange;
      controller.axis = axis;
      controller.lastPosition = [position.x, position.y, position.z];
    });

    // var controller1 = this.controllers[0].delta;
    // var controller2 = this.controllers[1].delta;
    // controller1.normalize();
    // controller2.normalize();
    // var dot = Math.abs(controller1.dot(controller2));

    // if (dot > 0.5) {
    //   console.log('scale! ' + );
    // }

    controller1 = this.controllers[0];
    controller2 = this.controllers[1];
    if (controller1.axis === controller2.axis) {
      // var mag1 = controller1.delta[controller1.axis];
      // var mag2 = controller2.delta[controller2.axis];
      // var size = 1+(Math.abs(mag1) + Math.abs(mag2));
      console.log('parallel', controller1.axis);
      var con1Pos = new THREE.Vector3().fromArray(controller1.lastPosition);
      var con2Pos = new THREE.Vector3().fromArray(controller2.lastPosition);      
      var distance = con1Pos.distanceTo(con2Pos) / 2;

      
      //console.log('moving same axis ', controller1.axis, distance);
      //
      //
      
    }
  }
};

