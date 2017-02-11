module.exports = {
  schema: {
    // size: { type: 'number', default: 1 }
  },

  multiple: false,

  init: function () {
    this.controllers = Array.prototype.slice.call(document.querySelectorAll('a-entity[hand-controls]'));
    this.grabbed = [];
    this.gripped = [];
    this.selected = null;
  },

  play: function () {
    // this.grabbed = false;
    this.controllers.forEach(function (controller) {
      controller.addEventListener('gripclose', this.onGripClose.bind(this));
      controller.addEventListener('gripopen', this.onGripOpen.bind(this));
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
    this.grabbed = ar;

    this.gripped.splice(this.gripped.indexOf(hand), 1);
  },

  clearSelected: function() {
    var selected = Array.prototype.slice.call(this.el.querySelectorAll('[selected]'));
    selected.forEach(function (el) {
      el.removeAttribute('selected');
    });

    self.selected = null;
  },

  onGripClose: function (e) {
    var self = this;
    var hand = e.target;
    var hand3D = e.target.object3D;
    var handBB = new THREE.Box3().setFromObject(hand3D);

    var els =  Array.prototype.slice.call(this.el.children);
    var collisions = false;
    els.forEach(function (el) {
      if (el === hand) return;
      if (el.getObject3D === undefined) return;
      var mesh = el.getObject3D('mesh');
      if (!mesh) return;

      var objectBB = new THREE.Box3().setFromObject(mesh);
      var collision = handBB.intersectsBox(objectBB);
      if (collision && !collisions) {
        // self.grabbed = el;
        self.grabbed.push({
          hand: hand,
          el: el
        })
        collisions = true;
      }
    });

    this.clearSelected();

    this.gripped.push(hand);
  },

  tick: function () {
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

      var pos1 = controller1.getAttribute('position');
      var pos2 = controller2.getAttribute('position');

      var vec1 = new THREE.Vector3(pos1.x, pos1.y, pos1.z);
      var vec2 = new THREE.Vector3(pos2.x, pos2.y, pos2.z);

      var scale = this.selected.getAttribute('scale');
      var diff = vec1.distanceTo(vec2);

      if (!this.scaleOrigin && !this.distanceOrigin) {
        this.scaleOrigin = scale;
        this.distanceOrigin = diff;
      }

      var diff = diff - this.distanceOrigin;

      this.selected.setAttribute('scale', {
        x: this.scaleOrigin.x + diff,
        y: this.scaleOrigin.y + diff,
        z: this.scaleOrigin.z + diff
      })
    } else {
      this.scaleOrigin = null;
      this.distanceOrigin = null;
    }


    // if (this.grabbed) {
    //   this.grabbed.setAttribute('position');
    // }

    // // if (this.grabbed) {
    //   var axis = 'z';
    //   var handRotation = this.grabbed.rotation[axis];
    //   var deltaChange = !this.lastRotation ? 0 : handRotation - this.lastRotation;
    //   this.knob.rotation.y += deltaChange;
    //   this.el.emit('change', { value: deltaChange * -1 });
    //   this.lastRotation = handRotation;
    // } else {
    //   this.lastRotation = 0;
    // }
  }
};

