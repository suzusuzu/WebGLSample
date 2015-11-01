/// <reference path="./Vector.ts"/>
/// <reference path="./ImgLoader.ts"/>

class ObjLoader {

  static loadObj(objsource: string): Obj{
    var positions: number[][] = [];
    var uvs: number[][] = [];
    var normals: number[][] = [];
    var mtlname: string;

    var faces: FACE[] = [];

    var lines: string[] = objsource.split('\n');
    for(var i:number = 0;i<lines.length;i++){
      var line: string = lines[i];
      var words: string[] = line.split(" ");
      switch(words[0]){
        case "usemtl":
        mtlname = words[1];
        break;
        case "v":
        positions.push([+words[1], +words[2], +words[3]]);
        break;
        case "vt":
        uvs.push([+words[1], +words[2]]);
        break;
        case "vn":
        normals.push([+words[1], +words[2], +words[3]]);
        break;
        case "f":
        var face: FACE = new FACE();
        face.mtlname = mtlname;
        for(var j:number=1;j<words.length;j++){
          var nums: number[] = (words[j]+"//").split("/").map(x => {return +x;});

          face.vertexindex.push(nums[0]);
          if(nums[1] != 0){
            face.uvindex.push(nums[1]);
          }
          if(nums[2] != 0){
            face.normalindex.push(nums[2]);
          }
        }
        faces.push(face);
        break;
        default:
        break;
      }
    }
    return new Obj(positions, uvs, normals, faces);
  }

  static loadMtl(mtlsource: string): {[key: string]: Material}{
    var materials: {[key: string]: Material;} = {};
    var mtlsource_tmp: string = mtlsource.replace(/\r\n | \r/g, "\n");
    var lines: string[] = mtlsource_tmp.split(/\n/);
    var material: Material;
    for(var i:number = 0;i<lines.length;i++){
      var line: string = lines[i];
      var words: string[] = line.split(" ");

      switch(words[0]){
        case "newmtl":
        material = new Material();
        materials[words[1]] = material;
        break;
        case "Ka":
        material.ambient = new Float32Array([+words[1], +words[2], +words[3]]);
        break;
        case "Kd":
        material.diffuse = new Float32Array([+words[1], +words[2], +words[3]]);
        break;
        case "Ks":
        material.specular = new Float32Array([+words[1], +words[2], +words[3]]);
        break;
        case "Ns":
        material.shininess = +words[1];
        break;
        case "map_Kd":
        material.texture = words[1];
        break;
        default:
        break;
      }
    }
    return materials;
  }

  public static createGlObject(obj: Obj, mtl:{[key: string]: Material}): GlObject{

    var numTriangles: number = 0;
    for(var i:number=0;i<obj.faces.length;i++){
      numTriangles += obj.faces[i].vertexindex.length -2;
    }
    var vertices: Float32Array = new Float32Array(numTriangles * 3 * 3);
    var uvs: Float32Array = new Float32Array(numTriangles * 3 * 2);
    var normals: Float32Array = new Float32Array(numTriangles * 3 * 3);

    var mtlInfos: MtlInfo[] = [];
    var currentMtlName: string;

    var trianglecount: number;

    function saveMtlInfo(){
      if(!mtl){
        mtlInfos.push(new MtlInfo(trianglecount*9,
          Vec3.create(0.0, 0.0, 0.0),
          Vec3.create(0.5, 0.5, 0.5),
          Vec3.create(0.0, 0.0, 0.0),
          1,
          null));
        }else if(currentMtlName){
          var texture: string = mtl[currentMtlName].texture;
          if(texture){
            ImgLoader.load(texture);
          }
          mtlInfos.push(new MtlInfo(trianglecount*9,
            mtl[currentMtlName].ambient,
            mtl[currentMtlName].diffuse,
            mtl[currentMtlName].specular,
            mtl[currentMtlName].shininess,
            texture));
          }
        }
        trianglecount = 0;
        for(var i:number = 0;i<obj.faces.length;i++){
          var face:FACE = obj.faces[i];

          if(currentMtlName != face.mtlname){
            saveMtlInfo();
            currentMtlName = face.mtlname;
          }

          for(var j:number = 1;j<face.vertexindex.length -1;j++){
            var vertexindex0: number = face.vertexindex[0] - 1;
            var vertexindex1: number = face.vertexindex[j] - 1;
            var vertexindex2: number = face.vertexindex[j+1] - 1;

            var vertex0: Float32Array = Vec3.create(obj.vertices[vertexindex0][0], obj.vertices[vertexindex0][1], obj.vertices[vertexindex0][2]);
            var vertex1: Float32Array = Vec3.create(obj.vertices[vertexindex1][0], obj.vertices[vertexindex1][1], obj.vertices[vertexindex1][2]);
            var vertex2: Float32Array = Vec3.create(obj.vertices[vertexindex2][0], obj.vertices[vertexindex2][1], obj.vertices[vertexindex2][2]);

            vertices.set(vertex0, trianglecount*9);
            vertices.set(vertex1, trianglecount*9 + 3);
            vertices.set(vertex2, trianglecount*9 + 6);

            var uvindex0: number = face.uvindex[0] -1;
            var uvindex1: number = face.uvindex[j] -1;
            var uvindex2: number = face.uvindex[j+1] -1;

            var uv0: Float32Array = Vec2.create(obj.uvs[uvindex0][0], obj.uvs[uvindex0][1]);
            var uv1: Float32Array = Vec2.create(obj.uvs[uvindex1][0], obj.uvs[uvindex1][1]);
            var uv2: Float32Array = Vec2.create(obj.uvs[uvindex2][0], obj.uvs[uvindex2][1]);

            uvs.set(uv0, trianglecount*6);
            uvs.set(uv1, trianglecount*6 + 2);
            uvs.set(uv2, trianglecount*6 + 4);

            var normalindex0: number = face.normalindex[0] - 1;
            var normalindex1: number = face.normalindex[j] - 1;
            var normalindex2: number = face.normalindex[j+1] - 1;

            var normal0: Float32Array = Vec3.create(obj.normals[normalindex0][0], obj.normals[normalindex0][1], obj.normals[normalindex0][2]);
            var normal1: Float32Array = Vec3.create(obj.normals[normalindex1][0], obj.normals[normalindex1][1], obj.normals[normalindex1][2]);
            var normal2: Float32Array = Vec3.create(obj.normals[normalindex2][0], obj.normals[normalindex2][1], obj.normals[normalindex2][2]);

            normals.set(normal0, trianglecount*9);
            normals.set(normal1, trianglecount*9 + 3);
            normals.set(normal2, trianglecount*9 + 6);

            trianglecount++;
          }
        }
        saveMtlInfo();
        return new GlObject(vertices, normals, uvs, mtlInfos);
      }
    }

    class Obj {
      public vertices: number[][];
      public uvs: number[][];
      public normals: number[][];
      public faces: FACE[];

      constructor(vertices: number[][], uvs: number[][], normals: number[][], faces: FACE[]){
        this.vertices = vertices;
        this.uvs = uvs;
        this.normals = normals;
        this.faces = faces;
      }
    }

    class Material {
      public ambient: Float32Array;
      public diffuse: Float32Array;
      public specular: Float32Array;
      public shininess: number;
      public texture: string;
    }

    class MtlInfo {
      public endPos: number;
      public ambient: Float32Array;
      public diffuse: Float32Array;
      public specular: Float32Array;
      public shininess: number;
      public texture: string;

      constructor(endPos: number, ambient: Float32Array, diffuse: Float32Array, specular: Float32Array, shininess: number, texture: string){
        this.endPos = endPos;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
        this.texture = texture;
      }
    }

    class GlObject {
      public vertices: Float32Array;
      public normals: Float32Array;
      public uvs: Float32Array;
      public mtlInfos: MtlInfo[];

      constructor(vertices: Float32Array, normals: Float32Array, uvs: Float32Array, mtlInfos: MtlInfo[]){
        this.vertices = vertices;
        this.normals = normals;
        this.uvs = uvs;
        this.mtlInfos = mtlInfos;
      }
    }

    class FACE {
      public vertexindex: number[] = [];
      public uvindex: number[] = [];
      public normalindex: number[] = [];
      public mtlname: string;
    }
