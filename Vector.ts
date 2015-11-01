class Vec3 {
  static create(x: number, y: number, z: number): Float32Array{
    var tmp: Float32Array = new Float32Array(3);
    tmp[0] = x;
    tmp[1] = y;
    tmp[2] = z;
    return tmp;
  }

}

class Vec2 {
  static create(x: number, y: number): Float32Array{
    var tmp: Float32Array = new Float32Array(2);
    tmp[0] = x;
    tmp[1] = y;
    return tmp;
  }
}
