# sp-rocket
Source code for sp-rocket.com. It generates 3D models of sprockets based on your parameters!
If you want to see the code in action, visit sp-rocket.com. It's written in node.js with a very simple server framework I cobbled together myself. It serves static files using the cachemere caching module, but will load modules and invoke methods given a properly-formatted URL.

The ajax URL pattern is:
```/~module::function```
The framework will attempt to load the `module` and call the exported `function` with the following signature:
```function(request, response, params)```
For the gear-specific code, look at `gearlib.js`. The meat of the function is in `getGearPoints()` which uses `sin`/`cos` to 'walk' a sine wave around the perimiter of a circle, generating the points to use to make the STL mesh.
