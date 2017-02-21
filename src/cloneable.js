module.exports = {
  schema: {
    // size: { type: 'number', default: 1 }
  },

  multiple: false,

  init: function () {
    this.controllers = Array.prototype.slice.call(document.querySelectorAll('a-entity[hand-controls]'));

    this.controllers = this.controllers.map(function (controller) {
      return {
        el: controller,
        lastPosition: new THREE.Vector3(), /* last position of controller */
        positionDelta: new THREE.Vector3(), /* delta between current position and last position */
        movementAxis: 0 /* dominant movement axis */
      }
    });

    this.grabbed = [];
    this.gripped = [];
    this.selected = null;

    this.debugEl = document.querySelector('#debug');
  },

  play: function () {
    // this.grabbed = false;
    this.controllers.forEach(function (controller) {
      controller.el.addEventListener('gripclose', this.onGripClose.bind(this));
      controller.el.addEventListener('gripopen', this.onGripOpen.bind(this));
    }.bind(this));

    // // handle collision dection (should be on triggerDown)
    // this.handles.forEach(function(handle) {
    //   var handleBB = new THREE.Box3().setFromObject(handle);
    //   // controller BB
    //   // collision detect
    // });
  },

  update: function () {
  },

  pause: function () {
    // this.controllers.forEach(function (controller) {
    //   controller.removeEventListener('triggerdown', this.onGripClose.bind(this));
    //   controller.removeEventListener('triggerup', this.onGripOpen.bind(this));
    // }.bind(this));
  },
  onGripClose: function (e) {
    var self = this;
    var hand = e.target;
    var hand3D = e.target.object3D;
    var handBB = new THREE.Box3().setFromObject(hand3D);

    var els =  Array.prototype.slice.call(this.el.children);
    els.forEach(function (el) {
      if (el === hand) return;
      if (el.getObject3D === undefined) return;
      var mesh = el.getObject3D('mesh');
      if (!mesh) return;

      var objectBB = new THREE.Box3().setFromObject(mesh);
      var collision = handBB.intersectsBox(objectBB);
      if (collision) {
        self.grabbed.push({ /* todo: could probably be in controllers array */
          hand: hand,
          el: el
        });
      }
    });
    this.clearSelected();
    this.gripped.push(hand); /* todo: could probably be in controllers array */
  },

  onGripOpen: function (e) {
    var self = this;
    var hand = e.target;

    var ar = [];
    this.grabbed.forEach(function (grab) {
      if (grab.hand !== hand) ar.push(grab);
      else {
        self.clearSelected();
        // add selector off last element edited.
        grab.el.setAttribute('selected','');
        self.selected = grab.el;
      }
    });
    this.grabbed = ar; /* todo: this should be array.filter */

    this.gripped.splice(this.gripped.indexOf(hand), 1);
  },

  clearSelected: function() {
    var selected = Array.prototype.slice.call(this.el.querySelectorAll('[selected]'));
    selected.forEach(function (el) {
      el.removeAttribute('selected');
    });

    self.selected = null;
  },

  tick: function (time) {
    var controllers = this.controllers;
    controllers.forEach(function (controller) {
      var position = controller.el.getAttribute('position');
      controller.positionDelta.x = position.x - controller.lastPosition.x;
      controller.positionDelta.y = position.y - controller.lastPosition.y;
      controller.positionDelta.z = position.z - controller.lastPosition.z;

      controller.lastPosition.x = position.x;
      controller.lastPosition.y = position.y;
      controller.lastPosition.z = position.z;
    });


    var ControlVec1 = new THREE.Vector3().set(controllers[0].positionDelta.x,
      controllers[0].positionDelta.y,
      controllers[0].positionDelta.z);
    var ControlVec2 = new THREE.Vector3().set(controllers[1].positionDelta.x,
      controllers[1].positionDelta.y,
      controllers[1].positionDelta.z);

    ControlVec1.normalize();
    ControlVec2.normalize();

    var dot = ControlVec1.dot(ControlVec2);
    var threshold = 0.8;
    if (dot > threshold) {
      // console.log('controllers are pallel and moving same direction');
    } else if (dot < -threshold) {
      // console.log('controllers are parallel, but opposite directions');
      // we're scaling!
    }


    // track center point between controllers
    var ControlPos1 = controllers[0].lastPosition;
    var ControlPos2 = controllers[1].lastPosition;

    var dir = ControlPos2.clone().sub(ControlPos1);

    var len = dir.length();
    dir = dir.normalize()
    // .multiplyScalar(len * 0.5);
    // var center = ControlPos1.clone().add(dir);
    // this.debugEl.setAttribute('position', {
    //   x: center.x,
    //   y: center.y,
    //   z: center.z
    // });
    // center.add(dir);
    // this.debugEl.object3D.lookAt(center);

    // var axisRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.normalize());

    // var camera = document.querySelector('a-entity[camera]');
    // axisRotation.multiply(camera.object3D.quaternion);
    // this.debugEl.object3D.quaternion.copy(axisRotation);



    // clone
    if (this.grabbed.length > 1) {
      if (this.grabbed[0].el === this.grabbed[1].el) {
        var copy = this.grabbed[0].el.cloneNode();
        this.el.appendChild(copy);
        this.grabbed[1].el = copy;
      }
    };

    // move
    this.grabbed.forEach(function (grab) {
      if (grab.hand && grab.el) {
        var position = grab.hand.getAttribute('position');
        grab.el.setAttribute('position', position);
      }
    });

    // scale
    if (this.gripped.length > 1 && this.selected && !this.grabbed.length > 0) {
      var controller1 = this.gripped[0];
      var controller2 = this.gripped[1];
      var controller1pos = controller1.getAttribute('position');
      var controller2pos = controller2.getAttribute('position');
      var controller1Vec = new THREE.Vector3(controller1pos.x, controller1pos.y, controller1pos.z);
      var controller2Vec = new THREE.Vector3(controller2pos.x, controller2pos.y, controller2pos.z);


      var selected = this.selected;

      var detect = [{
          direction: new THREE.Vector3(0, 0, 1),
          name: 'z'
        },{
          direction: new THREE.Vector3(0, 1, 0),
          name: 'y'
        },{
          direction: new THREE.Vector3(1, 0, 0),
          name: 'x'
        }];

      // store original scale when grabbing element
      if (!this.scaleOrigin && !this.distanceOrigin) {
        this.scaleOrigin = selected.getAttribute('scale');
        this.distanceOrigin = controller1Vec.distanceTo(controller2Vec);
      }

      var distanceChange = controller1Vec.distanceTo(controller2Vec) - this.distanceOrigin;

      // apply scale to proper axis
      for (var i = 0; i < detect.length; i++) {
        var axis = detect[i];

        var selectedDir = axis.direction.applyQuaternion(selected.object3D.quaternion);

        var dot = dir.dot(selectedDir);
        var thresh = 0.8;
        if (dot > thresh || dot < -thresh) {
          selected.setAttribute('scale', {
            [axis.name]: this.scaleOrigin[axis.name] + distanceChange
          })
          break;
        }
      }
    } else {
      this.scaleOrigin = null;
      this.distanceOrigin = null;
    }
  }
};

