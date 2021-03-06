class Mat4 {
  public static createIdentity(): Float32Array{
    var tmp: Float32Array = new Float32Array(16);
    tmp[0] = 1;
    tmp[1] = 0;
    tmp[2] = 0;
    tmp[3] = 0;
    tmp[4] = 0;
    tmp[5] = 1;
    tmp[6] = 0;
    tmp[7] = 0;
    tmp[8] = 0;
    tmp[9] = 0;
    tmp[10] = 1;
    tmp[11] = 0;
    tmp[12] = 0;
    tmp[13] = 0;
    tmp[14] = 0;
    tmp[15] = 1;
    return tmp;
  }

  public static invert = function(a) {
    var out: Float32Array = new Float32Array(16);
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
    a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
    a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
    a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

    b00 = a00 * a11 - a01 * a10,
    b01 = a00 * a12 - a02 * a10,
    b02 = a00 * a13 - a03 * a10,
    b03 = a01 * a12 - a02 * a11,
    b04 = a01 * a13 - a03 * a11,
    b05 = a02 * a13 - a03 * a12,
    b06 = a20 * a31 - a21 * a30,
    b07 = a20 * a32 - a22 * a30,
    b08 = a20 * a33 - a23 * a30,
    b09 = a21 * a32 - a22 * a31,
    b10 = a21 * a33 - a23 * a31,
    b11 = a22 * a33 - a23 * a32,

    det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
  };

  public static transpose = function(a) {
    var a01 = a[1], a02 = a[2], a03 = a[3],
    a12 = a[6], a13 = a[7],
    a23 = a[11];

    var out: Float32Array = new Float32Array(16);

    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
    return out;
  }

  public static frustum (left:number, right: number, bottom: number, top:number, near:number, far:number) {
    var out: Float32Array = new Float32Array(16);
    var rl = 1 / (right - left);
    var tb = 1 / (top - bottom);
    var nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
  }

  public static lookAt = function (eye, center, up) {
    var out: Float32Array = new Float32Array(16);
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
    eyex = eye[0],
    eyey = eye[1],
    eyez = eye[2],
    upx = up[0],
    upy = up[1],
    upz = up[2],
    centerx = center[0],
    centery = center[1],
    centerz = center[2];

    if (Math.abs(eyex - centerx) < 0.00001 &&
    Math.abs(eyey - centery) < 0.00001 &&
    Math.abs(eyez - centerz) < 0.00001 ) {
      return Mat4.createIdentity();}

      z0 = eyex - centerx;
      z1 = eyey - centery;
      z2 = eyez - centerz;

      len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
      z0 *= len;
      z1 *= len;
      z2 *= len;

      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
      if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
      } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }

      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;

      len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
      if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
      } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
      }

      out[0] = x0;
      out[1] = y0;
      out[2] = z0;
      out[3] = 0;
      out[4] = x1;
      out[5] = y1;
      out[6] = z1;
      out[7] = 0;
      out[8] = x2;
      out[9] = y2;
      out[10] = z2;
      out[11] = 0;
      out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
      out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
      out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
      out[15] = 1;

      return out;
    };

    public static translate(a: Float32Array, v:Float32Array) {
      var x = v[0], y = v[1], z = v[2],
      a00, a01, a02, a03,
      a10, a11, a12, a13,
      a20, a21, a22, a23;

      var out: Float32Array = new Float32Array(16);
      a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
      a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
      a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

      out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
      out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
      out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];

      return out;
    };
    public static rotate (a:Float32Array, rad:number, axis:Float32Array) {
      var x = axis[0], y = axis[1], z = axis[2],
      len = Math.sqrt(x * x + y * y + z * z),
      s, c, t,
      a00, a01, a02, a03,
      a10, a11, a12, a13,
      a20, a21, a22, a23,
      b00, b01, b02,
      b10, b11, b12,
      b20, b21, b22;

      var out: Float32Array = new Float32Array(16);

      len = 1 / len;
      x *= len;
      y *= len;
      z *= len;

      s = Math.sin(rad);
      c = Math.cos(rad);
      t = 1 - c;

      a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
      a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
      a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

      b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
      b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
      b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

      out[0] = a00 * b00 + a10 * b01 + a20 * b02;
      out[1] = a01 * b00 + a11 * b01 + a21 * b02;
      out[2] = a02 * b00 + a12 * b01 + a22 * b02;
      out[3] = a03 * b00 + a13 * b01 + a23 * b02;
      out[4] = a00 * b10 + a10 * b11 + a20 * b12;
      out[5] = a01 * b10 + a11 * b11 + a21 * b12;
      out[6] = a02 * b10 + a12 * b11 + a22 * b12;
      out[7] = a03 * b10 + a13 * b11 + a23 * b12;
      out[8] = a00 * b20 + a10 * b21 + a20 * b22;
      out[9] = a01 * b20 + a11 * b21 + a21 * b22;
      out[10] = a02 * b20 + a12 * b21 + a22 * b22;
      out[11] = a03 * b20 + a13 * b21 + a23 * b22;

      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];

      return out;
    };

    public static rotateQ (a:Float32Array, rad:number, axis:Float32Array):Float32Array {
      var out: Float32Array = new Float32Array(16);
      var Ax, Ay, Az;
      var len;
      var x, y, z, w;
      var a00, a01, a02, a03,
      a10, a11, a12, a13,
      a20, a21, a22, a23;

      var R00, R01, R02,
      R10, R11, R12,
      R20, R21, R22;

      Ax = axis[0];
      Ay = axis[1];
      Az = axis[2];
      len = Math.sqrt(Ax*Ax+Ay*Ay+Az*Az);
      len = 1 / len;
      Ax *= len;
      Ay *= len;
      Az *= len;

      w = Math.cos(rad/2);
      x = Ax*Math.sin(rad/2);
      y = Ay*Math.sin(rad/2);
      z = Az*Math.sin(rad/2);

      a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
      a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
      a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

      R00 = 1 - 2*y*y - 2*z*z;
      R01 = 2*x*y - 2*w*z;
      R02 = 2*x*z + 2*w*y;
      R10 = 2*x*y + 2*w*z;
      R11 = 1 - 2*x*x - 2*z*z;
      R12 = 2*y*z - 2*w*x;
      R20 = 2*x*z - 2*w*y;
      R21 = 2*y*z + 2*w*x;
      R22 = 1 - 2*x*x - 2*y*y;

      out[0] = a00 * R00 + a10 * R01 + a20 * R02;
      out[1] = a01 * R00 + a11 * R01 + a21 * R02;
      out[2] = a02 * R00 + a12 * R01 + a22 * R02;
      out[3] = a03 * R00 + a13 * R01 + a23 * R02;
      out[4] = a00 * R10 + a10 * R11 + a20 * R12;
      out[5] = a01 * R10 + a11 * R11 + a21 * R12;
      out[6] = a02 * R10 + a12 * R11 + a22 * R12;
      out[7] = a03 * R10 + a13 * R11 + a23 * R12;
      out[8] = a00 * R20 + a10 * R21 + a20 * R22;
      out[9] = a01 * R20 + a11 * R21 + a21 * R22;
      out[10] = a02 * R20 + a12 * R21 + a22 * R22;
      out[11] = a03 * R20 + a13 * R21 + a23 * R22;

      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];

      return out;
    };

    public static scale(a: Float32Array, v: Float32Array) {
      var x = v[0], y = v[1], z = v[2];
      var out: Float32Array = new Float32Array(16);
      out[0] = a[0] * x;
      out[1] = a[1] * x;
      out[2] = a[2] * x;
      out[3] = a[3] * x;
      out[4] = a[4] * y;
      out[5] = a[5] * y;
      out[6] = a[6] * y;
      out[7] = a[7] * y;
      out[8] = a[8] * z;
      out[9] = a[9] * z;
      out[10] = a[10] * z;
      out[11] = a[11] * z;
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    };
  }
