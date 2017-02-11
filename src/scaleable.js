module.exports = {
  schema: {
    // size: { type: 'number', default: 1 }
  },

  multiple: false,

  init: function () {
    var self = this;

    var el = this.el;
    var mesh = el.getObject3D('mesh');
    var object3D = el.object3D;

    var margin = 0.1;

    // add box helper
    var helper = new THREE.BoxHelper(mesh);
    object3D.add(helper);

    // add handles
    var meshBB = new THREE.Box3().setFromObject(mesh);

    var material = new THREE.MeshBasicMaterial({ color: 0x99FFE1 });
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.05), material);

    this.handles = [];

    var handles = [
      {
        axis: 'y',
        direction: 1
      },
      {
        axis: 'y',
        direction: -1
      },
      {
        axis: 'x',
        direction: 1
      },
      {
        axis: 'x',
        direction: -1
      },
      {
        axis: 'z',
        direction: 1
      },
      {
        axis: 'z',
        direction: -1
      },
    ]

    handles.forEach(function (handle) {
      var mesh = sphere.clone();
      mesh.position[handle.axis] = (meshBB.max[handle.axis] + margin) * handle.direction;
      object3D.add(mesh);
      self.handles.push(mesh);
    });

    this.controllers = Array.prototype.slice.call(document.querySelectorAll('a-entity[hand-controls]'));
  },

  play: function () {
    this.grabbed = false;
    this.controllers.forEach(function (controller) {
      controller.addEventListener('triggerdown', this.onTriggerDown.bind(this));
      controller.addEventListener('triggerup', this.onTriggerUp.bind(this));
    }.bind(this));


    // handle collision dection (should be on triggerDown)
    this.handles.forEach(function(handle) {
      var handleBB = new THREE.Box3().setFromObject(handle);
      // controller BB
      // collision detect
    });
  },

  pause: function () {
    this.controllers.forEach(function (controller) {
      controller.removeEventListener('triggerdown', this.onTriggerDown.bind(this));
      controller.removeEventListener('triggerup', this.onTriggerUp.bind(this));
    }.bind(this));
  },

  onTriggerUp: function () {
    if (this.grabbed) {
      this.grabbed.visible = true;
      this.grabbed = false;
    }
  },

  onTriggerDown: function (e) {
    // collision detection on handles


    var hand = e.target.object3D;
    var knob = this.knob;

    var handBB = new THREE.Box3().setFromObject(hand);
    var knobBB = new THREE.Box3().setFromObject(knob);
    var collision = handBB.intersectsBox(knobBB);

    if (collision) {
      this.grabbed = hand;
      this.grabbed.visible = false;
    };
  },

  tick: function () {
    if (this.grabbed) {
      var axis = 'z';
      var handRotation = this.grabbed.rotation[axis];
      var deltaChange = !this.lastRotation ? 0 : handRotation - this.lastRotation;
      this.knob.rotation.y += deltaChange;
      this.el.emit('change', { value: deltaChange * -1 });
      this.lastRotation = handRotation;
    } else {
      this.lastRotation = 0;
    }
  }
};

