## aframe-dev-components

Helpers for making [A-Frame](https://aframe.io) easier and fun to work with.

For [A-Frame](https://aframe.io).

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.4.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-dev-components/dist/aframe-dev-components.min.js"></script>
</head>

<body>
  <a-scene>
    <!-- A-Frame markup -->
  </a-scene>
</body>
```

### Components

#### retain-camera

Retains camera position and orientation through scene reloads.

```html
<a-scene retain-camera></a-scene>
```

| Key           | Description
| ------------- | -------------
| ` | reset to original camera.


### npm

Install via npm:

```bash
npm install aframe-dev-components
```

Then require and use.

```js
require('aframe');
require('aframe-dev-components');
```
