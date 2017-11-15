var gl,
canvas;

window.onload = function () {
  canvas = document.getElementById("canvas");

  // Initialize the GL context
  gl = initWebGL(canvas);

  // Only continue if WebGL is available and working
  if (gl) {
    // Set clear color to white, fully opaque
    gl.clearColor(1, 1, 1, 1.0);
    // Clear the color as well as the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }


  // Create shaders
  // We pass our webgl context,
  // gl.VERTEX_SHADER | gl.FRAGMENT_SHADER which is an webgl constant and tells us the type of shader
  // and our function string declared at the bottom;
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

  // We need to tell webgl that we are using these shaders
  // We do this by creating a program
  var program = createProgram(gl, vertexShader, fragmentShader);

  // Create buffers
  //
  // Array Containing attributes of our vertices
  var triangleVertices = [
    // X, Y    // COLOR: R, G, B
    0.0, 0.5,   1,0,0,
    -0.5, -0.5, 0,1,0,
    0.5, -0.5,  0,0,1
  ];

  // Create Buffer on GPU
  var triangleVerticesbuffer = gl.createBuffer();
  // tell webgl that we are creating an array buffer and pass our created buffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesbuffer);
  // WebGl uses what ever buffer is available
  // no need to pass our created buffer
  // bufferData needs an float32Array (javascript uses by default Float64Array)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

  // Tell webgl what infromation is what in our triangleVertices
  // we pass our program (2 shaders) and the attribute name of our shader function
  // For position
  var positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
  gl.vertexAttribPointer(
    positionAttributeLocation, //Attribute location
    2, // Number of elements per Attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // Normalised or not
    5 * Float32Array.BYTES_PER_ELEMENT,// Size of Attribute
    0// Offest from the beginning of a vertex
  );
  // For Color
  var positionAttributeColor = gl.getAttribLocation(program, 'vertColor');
  gl.vertexAttribPointer(
    positionAttributeColor, //Attribute location
    3, // Number of elements per Attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // Normalised or not
    5 * Float32Array.BYTES_PER_ELEMENT,// Size of Attribute
    2 * Float32Array.BYTES_PER_ELEMENT // Offest from the beginning of a vertex
  );

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(positionAttributeColor);

  // Main Render loop
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

};

function initWebGL(canvas) {
  gl = null;

  // Try to grab the standard context. If it fails, fallback to experimental.
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  // If we don't have a GL context, give up now
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }

  return gl;
}

function createShader(gl, type, source) {
  // create and set type of shader
  var shader = gl.createShader(type);

  // set shader source and compile
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // Check if there were compile errors
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  // else delete shader and log error to user;
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();

  // Attach shaders and link them
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // Check if there were compile errors
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  // else delete program and log error to user;
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

// The Vertex Shader and Fragment Shader need to be in C/C++ code.
// For simplicity we'll just put them in strings.
var vertexShaderText = [
  'attribute vec2 vertPosition;',   // an attribute will receive data from a buffer (x, y)
  'attribute vec3 vertColor;',   // an attribute will receive data from a buffer (r,g,b)

  'varying vec3 fragColor;',

  'void main() {',
    'fragColor = vertColor;',
    // gl_Position is a special variable a vertex shader is responsible for setting
    // we get x,y values from vertPosition and set z value to 0.0
    'gl_Position = vec4(vertPosition, 0.0, 1.0);',
  '}'
].join('\n');

var fragmentShaderText = [
  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default. It means "medium precision"
  'precision mediump float;',

  'varying vec3 fragColor;',

  'void main() {',
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    'gl_FragColor = vec4(fragColor, 1);', 
  '}'
].join('\n');
