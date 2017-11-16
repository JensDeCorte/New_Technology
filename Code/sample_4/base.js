var gl,
canvas;

window.onload = function () {
  canvas = document.getElementById("canvas");

  gl = initWebGL(canvas);

  if (gl) {
    gl.clearColor(0.8, 0.9, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }


  // Create shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

  var program = createProgram(gl, vertexShader, fragmentShader);

  // Create buffers
  var boxVertices = [
    // X, Y, Z   // COLOR: U, V
      // Top
      -1.0, 1.0, -1.0,   0, 0,
  		-1.0, 1.0, 1.0,    0, 1,
  		1.0, 1.0, 1.0,     1, 1,
  		1.0, 1.0, -1.0,    1, 0,

  		// Left
  		-1.0, 1.0, 1.0,    0, 0,
  		-1.0, -1.0, 1.0,   1, 0,
  		-1.0, -1.0, -1.0,  1, 1,
  		-1.0, 1.0, -1.0,   0, 1,

  		// Right
  		1.0, 1.0, 1.0,    1, 1,
  		1.0, -1.0, 1.0,   0, 1,
  		1.0, -1.0, -1.0,  0, 0,
  		1.0, 1.0, -1.0,   1, 0,

  		// Front
  		1.0, 1.0, 1.0,    1, 1,
  		1.0, -1.0, 1.0,    1, 0,
  		-1.0, -1.0, 1.0,    0, 0,
  		-1.0, 1.0, 1.0,    0, 1,

  		// Back
  		1.0, 1.0, -1.0,    0, 0,
  		1.0, -1.0, -1.0,    0, 1,
  		-1.0, -1.0, -1.0,    1, 1,
  		-1.0, 1.0, -1.0,    1, 0,

  		// Bottom
  		-1.0, -1.0, -1.0,   1, 1,
  		-1.0, -1.0, 1.0,    1, 0,
  		1.0, -1.0, 1.0,     0, 0,
  		1.0, -1.0, -1.0,    0, 1
  ];

  // which vertices form a triangle
  // index list
  var boxIndices =
	[
		// Top
    0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

  // Create Buffer on GPU
  var BoxVertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, BoxVertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

  // Create Buffer on GPU
  var BoxIndexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, BoxIndexbuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

  // Create Pointers
  var positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
  var texCoordAttributeLocation = gl.getAttribLocation(program, 'vertTexCoord');

  gl.vertexAttribPointer(
    positionAttributeLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  // For texture
  gl.vertexAttribPointer(
    texCoordAttributeLocation,
    2,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(texCoordAttributeLocation);

  // Create texture
  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('crate-image')
  );

  gl.bindTexture(gl.TEXTURE_2D, null);

  // Tell WebGL which program should be active
  gl.useProgram(program);

  var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
  var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
  var matViewUniformLocation = gl.getUniformLocation(program, 'mView');

  var projMatrix = new Float32Array(16);
  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0,0,-6],[0,0,0],[0,1,0]);
  mat4.identity(projMatrix);
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width/canvas.height, 0.1, 1000.1);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

  // Main Render loop
  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  var angle;
  var loop = function(){
    angle = performance.now() / 1000 / 6 * 2 * Math.PI;
    mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
    mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clearColor(0.8, 0.9, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
		gl.activeTexture(gl.TEXTURE0);

    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

};

function initWebGL(canvas) {
  gl = null;
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }

  return gl;
}

function createShader(gl, type, source) {
  // create and set type of shader
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // Check if there were compile errors
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

var vertexShaderText = [
  'attribute vec3 vertPosition;',
  'attribute vec2 vertTexCoord;',

  'varying vec2 fragTexCoord;',

  'uniform mat4 mWorld;',
  'uniform mat4 mView;',
  'uniform mat4 mProj;',

  'void main() {',
    'fragTexCoord = vertTexCoord;',

    'gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
  '}'
].join('\n');

var fragmentShaderText = [

  'precision mediump float;',

  'varying vec2 fragTexCoord;',
  'uniform sampler2D sampler;',

  'void main() {',
    'gl_FragColor = texture2D(sampler, fragTexCoord);',
  '}'
].join('\n');
