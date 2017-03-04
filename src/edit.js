module.exports = {
  schema: {
    // size: { type: 'number', default: 1 }
  },

  multiple: false,

  init: function () {
    var controllers = Array.prototype.slice.call(document.querySelectorAll('a-entity[hand-controls]'));
    this.controllers = controllers.map(function (controller) {
      return {
        el: controller,
        position: new THREE.Vector3(), /* last position of controller */
        positionDelta: new THREE.Vector3() /* delta between current position and last position */
      }
    });

    this.grabbed = [];
    this.gripped = [];
    this.selected = null;
  },

  play: function () {
    this.controllers.forEach(function (controller) {
      controller.el.addEventListener('gripclose', this.onGripClose.bind(this));
      controller.el.addEventListener('gripopen', this.onGripOpen.bind(this));
    }.bind(this));
  },

  pause: function () {
    this.controllers.forEach(function (controller) {
      controller.removeEventListener('triggerdown', this.onGripClose.bind(this));
      controller.removeEventListener('triggerup', this.onGripOpen.bind(this));
    }.bind(this));
  },

  onGripClose: function (e) {
    var self = this;
    var hand = e.target;
    var hand3D = e.target.object3D;
    var handBB = new THREE.Box3().setFromObject(hand3D);

    var els = Array.prototype.slice.call(this.el.children);
    els.forEach(function (el) {
      if (el === hand) return;
      if (el.getObject3D === undefined) return;
      var mesh = el.getObject3D('mesh');
      if (!mesh) return;

      var objectBB = new THREE.Box3().setFromObject(mesh);
      var collision = handBB.intersectsBox(objectBB);
      if (collision) {
        // make sure we are grabbing just one element.
        self.grabbed = self.grabbed.filter(function (grab) {
          return hand !== grab.hand;
        });

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

    this.checkMove();

    var ar = [];
    this.grabbed.forEach(function (grab) {
      if (grab.hand !== hand) ar.push(grab);
      else {
        self.clearSelected();
        // add selector off last element edited.
        // grab.el.setAttribute('selected','');
        self.selected = grab.el;
      }
    });
    this.grabbed = ar; /* todo: this should be array.filter */

    this.gripped.splice(this.gripped.indexOf(hand), 1);
  },

  clearSelected: function() {
    // var selected = Array.prototype.slice.call(this.el.querySelectorAll('[selected]'));
    // selected.forEach(function (el) {
    //   el.removeAttribute('selected');
    // });

    self.selected = null;
  },

  updateControllerPosition: function () {
    this.controllers.forEach(function (controller) {
      var position = controller.el.getAttribute('position');
      controller.positionDelta.x = position.x - controller.position.x;
      controller.positionDelta.y = position.y - controller.position.y;
      controller.positionDelta.z = position.z - controller.position.z;
      controller.position.x = position.x;
      controller.position.y = position.y;
      controller.position.z = position.z;
    });
  },

  checkMove: function () {
    this.grabbed.forEach(function (grab) {
      if (grab.reParented) {
        console.log('dropping');
        grab.el.object3D.parent.updateMatrixWorld();
        var position = new THREE.Vector3().setFromMatrixPosition(grab.el.object3D.matrixWorld);
        var rotation = grab.el.object3D.getWorldQuaternion();
        grab.el.setAttribute('position', position);
        grab.el.object3D.setRotationFromQuaternion(rotation);
        // todo: not practical to write to euler.  Make & use matrix component instead.

        // var euler = new THREE.Euler().setFromRotationMatrix(grab.el.object3D.matrixWorld);
        // grab.el.setAttribute('rotation', {
        //   x: euler.x * (180 / Math.PI),
        //   y: euler.y * (180 / Math.PI),
        //   z: euler.z * (180 / Math.PI)
        // })

        grab.el.object3D.parent = grab.reParented;
        grab.reParented = false;
      };
    })
  },

  tick: function (time) {
    this.updateControllerPosition();

    // find direction delta between two controllers.
    var controller1Position = this.controllers[0].position;
    var controller2Position = this.controllers[1].position;
    var dir = controller2Position.clone().sub(controller1Position).normalize();

    // clone
    if (this.grabbed.length > 1 && this.grabbed[0].el === this.grabbed[1].el) {
      console.log('cloning');
      this.grabbed[0].el.flushToDOM();
      var copy = this.grabbed[0].el.cloneNode();

      var position = new THREE.Vector3().setFromMatrixPosition(this.grabbed[1].el.object3D.matrixWorld);
      copy.setAttribute('position', position);

      this.el.appendChild(copy);
      this.grabbed[1].el = copy;
    };

    // move
    this.grabbed.forEach(function (grab) {
      if (grab.hand && grab.el) {
        if (!grab.reParented && grab.el.object3D.parent) {
          console.log('picking up');
          // reparent grabbed object to hand.
          grab.el.object3D.parent.updateMatrixWorld();
          grab.reParented = grab.el.object3D.parent;

          var handLocal = grab.hand.object3D.worldToLocal(grab.el.object3D.position);
          grab.el.object3D.position = handLocal;

          var handLocalRotation = grab.hand.object3D.quaternion.inverse().multiply(grab.el.object3D.quaternion);
          grab.el.object3D.setRotationFromQuaternion(handLocalRotation);

          grab.el.object3D.parent = grab.hand.object3D;
        }
      }
    });

    // scale
    if (this.gripped.length > 1 && this.selected && !this.grabbed.length > 0) {
      var selected = this.selected;

      var detect = [{
          name: 'z',
          direction: new THREE.Vector3(0, 0, 1)
        },{
          name: 'y',
          direction: new THREE.Vector3(0, 1, 0)
        },{
          name: 'x',
          direction: new THREE.Vector3(1, 0, 0)
        }];
      var thresh = 0.8; // axis threshold

      // store original scale when grabbing element
      if (!this.scaleOrigin && !this.distanceOrigin) {
        this.scaleOrigin = selected.getAttribute('scale');
        this.distanceOrigin = controller1Position.distanceTo(controller2Position);
      }

      var distanceChange = controller1Position.distanceTo(controller2Position) - this.distanceOrigin;

      // apply scale to proper axis
      for (var i = 0; i < detect.length; i++) {
        var axis = detect[i];

        var selectedDir = axis.direction.applyQuaternion(selected.object3D.quaternion);

        var dot = dir.dot(selectedDir);

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

