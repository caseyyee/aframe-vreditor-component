/* global localStorage */
module.exports = {
  init: function () {
    var scene = this.el;

    this.origCamera;

    window.addEventListener('beforeunload', function () {
      var camera = scene.camera.el;

      var position = camera.getAttribute('position');
      var rotation = camera.getAttribute('rotation');

      localStorage.setItem('a-frame-camera', JSON.stringify({
        position: position,
        rotation: rotation
      }));
     }, false);

    scene.addEventListener('loaded', this.onLoaded.bind(this));

    window.addEventListener('keydown', function(e) {
      if(e.key === '`') {
        var origCamera = this.origCamera;
        this.setCamera(origCamera.position, origCamera.rotation);
      }
    }.bind(this));

  },

  onLoaded: function() {
    if (!this.el.camera) {
      // the default camera isn't loaded yet, so try again
      // must be a better way to find this happening?
      setTimeout(function() {
        this.onLoaded.call(this)
      }.bind(this), 10);
      return;
    }

    var camera = this.el.camera.el;

    // save scene original camera
    this.origCamera = {
      position: camera.getAttribute('position'),
      rotation: camera.getAttribute('rotation')
    }

    // parse local storage saved camera from beforeunload.
    var savedCamera = localStorage['a-frame-camera'];
    var saved = JSON.parse(savedCamera);

    camera.setAttribute('position', saved.position);
    camera.setAttribute('rotation', saved.rotation);
  },

  setCamera: function(position, rotation) {
    var camera = this.el.camera.el;

    camera.setAttribute('position', position);
    camera.setAttribute('rotation', rotation);
  }
};

