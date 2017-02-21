## aframe-vreditor-component

A VR editor for [A-Frame](https://aframe.io).

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-vreditor-component/dist/aframe-vreditor-component.min.js"></script>
</head>

<body>
  <a-scene>
    <!-- A-Frame markup -->
  </a-scene>
</body>
```

### Components

#### edit

Make children of any entity editable in VR.

```html
<a-entity edit></a-scene>
```

### npm

Install via npm:

```bash
npm install aframe-vreditor-component
```

Then require and use.

```js
require('aframe');
require('aframe-vreditor-component');
```
