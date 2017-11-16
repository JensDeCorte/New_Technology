var gl,
canvas;

var initDemo = function () {
  loadTextResource('shader.vs.glsl', function (vsError, vsText) {
    if(vsError){
      alert('Fatal error getting Vertex Shader');
      console.error(vsError);
    }
    else{
      loadTextResource('shader.fs.glsl', function (fsError, fsText) {
        if(fsError){
          alert('Fatal error getting Fragment Shader');
          console.error(fsError);
        }
        else{
          loadJSONResource('Susan.json', function (modelError, modelObject) {
            if(modelError){
              alert('Fatal error getting Susan model');
              console.error(modelError);
            } else {
              loadImageResource('img/SusanTexture.png', function (imgError, img) {
                if(imgError){
                  alert('Fatal error getting Susan texture');
                  console.error(imgError);
                } else {
                  runDemo(vsText, fsText, img, modelObject);
                }
              });
            }
          });
        }
      });
    }
  });
};

var runDemo = function (vertexShaderText, fragmentShaderText, susanImage, susanModel) {
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
  var susanVertices = susanModel.meshes[0].vertices;
  var susanIndices = [].concat.apply([], susanModel.meshes[0].faces);
  var susanTexCoords = susanModel.meshes[0].texturecoords[0];

  // Create Buffer on GPU
  var susanPosVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanVertices), gl.STATIC_DRAW);

  // Create Buffer on GPU
  var susanTexCoordVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanTexCoords), gl.STATIC_DRAW);

  // Create Buffer on GPU
  var susanIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, susanIndexBufferObject);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(susanIndices), gl.STATIC_DRAW);

  // Create Pointers
  gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
  var positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
  gl.vertexAttribPointer(
    positionAttributeLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    3 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(positionAttributeLocation);

  // For texture
  gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
  var texCoordAttributeLocation = gl.getAttribLocation(program, 'vertTexCoord');
  gl.vertexAttribPointer(
    texCoordAttributeLocation,
    2,
    gl.FLOAT,
    gl.FALSE,
    2 * Float32Array.BYTES_PER_ELEMENT,
    0 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(texCoordAttributeLocation);


  // Create texture
  var susanTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, susanTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
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
    susanImage
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

    gl.bindTexture(gl.TEXTURE_2D, susanTexture);
		gl.activeTexture(gl.TEXTURE0);

    gl.drawElements(gl.TRIANGLES, susanIndices.length, gl.UNSIGNED_SHORT, 0);

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
