/// <reference path="./Matrix.ts"/>
/// <reference path="./Objloader.ts"/>
/// <reference path="./Vector.ts"/>
/// <reference path="./ImgLoader.ts"/>
var objname: string = 'hasuta_kappa.obj';
var mtlname: string = 'hasuta_kappa.mtl';
var tganame: string = "hasuta.tga";

class Files {
  public objsource: string;
  public mtlsource: string;
  public tgasource: Uint8Array;
}
var fileCount: number = 3;

var file = new Files();

var loadFile = function(url: string, file: Files, callback){
  var xhr: XMLHttpRequest = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState == 4 && xhr.status == 200){
      if(url == objname){
        file.objsource = xhr.responseText;
      }
      else if(url == mtlname){
        file.mtlsource = xhr.responseText;
      }
      else if(url == tganame){
        file.tgasource = new Uint8Array(xhr.response);
      }
        callback();
    }
  };
  xhr.open("GET", url, true);
  if(url == tganame){
    xhr.responseType = "arraybuffer";
  }
  xhr.send("");
};

window.onload = function(){
  var callback = function(){
    fileCount--;
    if(fileCount == 0){
      initialize();
    }
  };
  loadFile(objname, file, callback);
  loadFile(mtlname, file, callback);
  loadFile(tganame, file, callback);
};

var program: WebGLProgram;
var gl: WebGLRenderingContext;
var globj: GlObject;
var initialize = function(){

  var obj: Obj = ObjLoader.loadObj(file.objsource);
  var mtl: {[key: string]: Material} = ObjLoader.loadMtl(file.mtlsource);

  globj = ObjLoader.createGlObject(obj, mtl);

  var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
  gl = <WebGLRenderingContext>canvas.getContext("experimental-webgl") || <WebGLRenderingContext>canvas.getContext("webgl");

  var vertexshader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexshader, <string>(<HTMLScriptElement>document.getElementById("vertexshader")).text);
  gl.compileShader(vertexshader);

  if (!gl.getShaderParameter(vertexshader, gl.COMPILE_STATUS)) {
    var error = gl.getShaderInfoLog(vertexshader);
    alert(error);
  }

  var fragmentshader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentshader, <string>(<HTMLScriptElement>document.getElementById("fragmentshader")).text);
  gl.compileShader(fragmentshader);

  if (!gl.getShaderParameter(fragmentshader, gl.COMPILE_STATUS)) {
    var error = gl.getShaderInfoLog(fragmentshader);
    alert(error);
  }

  program = gl.createProgram();

  gl.attachShader(program, vertexshader);
  gl.attachShader(program, fragmentshader);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var error = gl.getShaderInfoLog(program);
    alert(error);
  }
  gl.useProgram(program);
  loadBuffer();
  drawFrame();

};

var vertexbuffer;
var normalbuffer;
var uvbuffer;
var textures: {[key: string]: WebGLTexture}={};
var loadBuffer = function(){

  vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, globj.vertices, gl.STATIC_DRAW);

  normalbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, globj.normals, gl.STATIC_DRAW);

  uvbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, globj.uvs, gl.STATIC_DRAW);

  for(var name in ImgLoader.images){
    var img = ImgLoader.images[name];
    var texuture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texuture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    textures[name] = texuture;
  }
}
var frame: number = 0;

var drawFrame = function(){
  frame++;

  var model_mat = Mat4.createIdentity();
  model_mat = Mat4.scale(model_mat, new Float32Array([0.5, 0.5, 0.5]));
  model_mat = Mat4.translate(model_mat, new Float32Array([0, -7, 0]));
  model_mat = Mat4.rotate(model_mat, frame * 0.01, new Float32Array([0, 1, 0]));

  var view_mat = Mat4.createIdentity();
  view_mat = Mat4.lookAt([0, 0, 15], [0, 0, -1], [0, 1, 0]);

  var projection_mat:Float32Array = Mat4.createIdentity();
  projection_mat = Mat4.frustum(-1, 1, -1, 1, 3, 30);

  var normal_mat  = Mat4.createIdentity();
  normal_mat = Mat4.transpose(model_mat);
  normal_mat = Mat4.invert(normal_mat);

  gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_ModelMatrix"), false, model_mat);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_ViewMatrix"), false, view_mat);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_ProjectionMatrix"), false, projection_mat);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_NormalMatrix"), false, normal_mat);

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  var vertexLocation = gl.getAttribLocation(program, "a_Position");
  var normalLocation = gl.getAttribLocation(program, "a_Normal");
  var uvLocation = gl.getAttribLocation(program, "a_Uv");

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  gl.vertexAttribPointer(vertexLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalbuffer);
  gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, true, 0, 0);
  gl.enableVertexAttribArray(normalLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, uvbuffer);
  gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(uvLocation);

  gl.uniform3fv(gl.getUniformLocation(program, "u_LightAmbient"), new Float32Array([1.0, 1.0, 1.0]));
  gl.uniform3fv(gl.getUniformLocation(program, "u_LightDiffuse"), new Float32Array([0.8, 0.8, 0.8]));
  gl.uniform3fv(gl.getUniformLocation(program, "u_LightSpecular"), new Float32Array([1.0, 1.0, 1.0]));
  gl.uniform3fv(gl.getUniformLocation(program, "u_LightPosition"), new Float32Array([1000, 1000, 1000]));

  var pos: number = 0;
  for(var i:number=0;i<globj.mtlInfos.length;i++){
    var mtlInfo = globj.mtlInfos[i];

    gl.uniform3fv(gl.getUniformLocation(program, "u_MaterialAmbient"), new Float32Array(mtlInfo.ambient));
    gl.uniform3fv(gl.getUniformLocation(program, "u_MaterialDiffuse"), new Float32Array(mtlInfo.diffuse));
    gl.uniform3fv(gl.getUniformLocation(program, "u_MaterialSpecular"), new Float32Array(mtlInfo.specular));
    gl.uniform1f(gl.getUniformLocation(program, "u_MaterialShininess"), mtlInfo.shininess);
    if(mtlInfo.texture){
      gl.bindTexture(gl.TEXTURE_2D, textures[mtlInfo.texture]);
      gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
      gl.uniform1f(gl.getUniformLocation(program, "hasTexture"), 1);
    }else{
      gl.uniform1f(gl.getUniformLocation(program, "hasTexture"), 0);
    }
    gl.drawArrays(gl.TRIANGLES, pos/3, (mtlInfo.endPos - pos)/3);
    pos = mtlInfo.endPos;
  }
  setTimeout(drawFrame, 12);
};
