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
        lastPosition: new THREE.Vector3(), /* last position of controller */
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
      controller.positionDelta.x = position.x - controller.lastPosition.x;
      controller.positionDelta.y = position.y - controller.lastPosition.y;
      controller.positionDelta.z = position.z - controller.lastPosition.z;
      controller.lastPosition.x = position.x;
      controller.lastPosition.y = position.y;
      controller.lastPosition.z = position.z;
    });
  },

  tick: function (time) {
    this.updateControllerPosition();

    // find direction delta between two controllers.
    var ControlPos1 = this.controllers[0].lastPosition;
    var ControlPos2 = this.controllers[1].lastPosition;
    var dir = ControlPos2.clone().sub(ControlPos1).normalize();

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
        var rotation = grab.hand.getAttribute('rotation');
        grab.el.setAttribute('position', position);
        grab.el.setAttribute('rotation', rotation);

        // el to local hand space
        // on release, hand space to world space.
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
        this.distanceOrigin = ControlPos1.distanceTo(ControlPos2);
      }

      var distanceChange = ControlPos1.distanceTo(ControlPos2) - this.distanceOrigin;

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

