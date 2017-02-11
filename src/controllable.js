module.exports = {
  schema: {
    // size: { type: 'number', default: 1 }
  },
  init: function () {
    var self = this;
    this.checkViveSupport()
      .then(function() {
        console.log('vive supported');
      })
      .catch(function() {
        console.log('no vive support, fallback to cursor');
        self.makeCursor();
      })
  },

  makeCursor: function () {
    var camera = this.el.camera.el;
    var entity = document.createElement('a-cursor');
    camera.appendChild(entity);

    entity.addEventListener('click', function (e) {
      var intersected = e.detail.intersectedEl;
      console.log(intersected);
    })
  },

  checkViveSupport: function() {
    return new Promise(function(resolve, reject) {
      var entity = document.createElement('a-entity');
      entity.setAttribute('vive-controls', '');
      this.el.appendChild(entity);
      entity.addEventListener('loaded', function () {
        if (entity.components['vive-controls'].controllerPresent) {
          entity.parent.removeChild(entity);
          resolve();
        } else {
          reject();
        }
      })
    })
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

