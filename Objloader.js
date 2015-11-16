/// <reference path="./Vector.ts"/>
/// <reference path="./ImgLoader.ts"/>
var ObjLoader = (function () {
    function ObjLoader() {
    }
    ObjLoader.loadObj = function (objsource) {
        var positions = [];
        var uvs = [];
        var normals = [];
        var mtlname;
        var faces = [];
        var lines = objsource.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var words = line.split(" ");
            switch (words[0]) {
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
                    var face = new FACE();
                    face.mtlname = mtlname;
                    for (var j = 1; j < words.length; j++) {
                        var nums = (words[j] + "//").split("/").map(function (x) { return +x; });
                        face.vertexindex.push(nums[0]);
                        if (nums[1] != 0) {
                            face.uvindex.push(nums[1]);
                        }
                        if (nums[2] != 0) {
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
    };
    ObjLoader.loadMtl = function (mtlsource) {
        var materials = {};
        var mtlsource_tmp = mtlsource.replace(/\r\n | \r/g, "\n");
        var lines = mtlsource_tmp.split(/\n/);
        var material;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var words = line.split(" ");
            switch (words[0]) {
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
    };
    ObjLoader.createGlObject = function (obj, mtl) {
        var numTriangles = 0;
        for (var i = 0; i < obj.faces.length; i++) {
            numTriangles += obj.faces[i].vertexindex.length - 2;
        }
        var vertices = new Float32Array(numTriangles * 3 * 3);
        var uvs = new Float32Array(numTriangles * 3 * 2);
        var normals = new Float32Array(numTriangles * 3 * 3);
        var mtlInfos = [];
        var currentMtlName;
        var trianglecount;
        function saveMtlInfo() {
            if (!mtl) {
                mtlInfos.push(new MtlInfo(trianglecount * 9, Vec3.create(0.0, 0.0, 0.0), Vec3.create(0.5, 0.5, 0.5), Vec3.create(0.0, 0.0, 0.0), 1, null));
            }
            else if (currentMtlName) {
                var texture = mtl[currentMtlName].texture;
                if (texture) {
                    ImgLoader.load(texture);
                }
                mtlInfos.push(new MtlInfo(trianglecount * 9, mtl[currentMtlName].ambient, mtl[currentMtlName].diffuse, mtl[currentMtlName].specular, mtl[currentMtlName].shininess, texture));
            }
        }
        trianglecount = 0;
        for (var i = 0; i < obj.faces.length; i++) {
            var face = obj.faces[i];
            if (currentMtlName != face.mtlname) {
                saveMtlInfo();
                currentMtlName = face.mtlname;
            }
            for (var j = 1; j < face.vertexindex.length - 1; j++) {
                var vertexindex0 = face.vertexindex[0] - 1;
                var vertexindex1 = face.vertexindex[j] - 1;
                var vertexindex2 = face.vertexindex[j + 1] - 1;
                var vertex0 = Vec3.create(obj.vertices[vertexindex0][0], obj.vertices[vertexindex0][1], obj.vertices[vertexindex0][2]);
                var vertex1 = Vec3.create(obj.vertices[vertexindex1][0], obj.vertices[vertexindex1][1], obj.vertices[vertexindex1][2]);
                var vertex2 = Vec3.create(obj.vertices[vertexindex2][0], obj.vertices[vertexindex2][1], obj.vertices[vertexindex2][2]);
                vertices.set(vertex0, trianglecount * 9);
                vertices.set(vertex1, trianglecount * 9 + 3);
                vertices.set(vertex2, trianglecount * 9 + 6);
                var uvindex0 = face.uvindex[0] - 1;
                var uvindex1 = face.uvindex[j] - 1;
                var uvindex2 = face.uvindex[j + 1] - 1;
                var uv0 = Vec2.create(obj.uvs[uvindex0][0], obj.uvs[uvindex0][1]);
                var uv1 = Vec2.create(obj.uvs[uvindex1][0], obj.uvs[uvindex1][1]);
                var uv2 = Vec2.create(obj.uvs[uvindex2][0], obj.uvs[uvindex2][1]);
                uvs.set(uv0, trianglecount * 6);
                uvs.set(uv1, trianglecount * 6 + 2);
                uvs.set(uv2, trianglecount * 6 + 4);
                var normalindex0 = face.normalindex[0] - 1;
                var normalindex1 = face.normalindex[j] - 1;
                var normalindex2 = face.normalindex[j + 1] - 1;
                var normal0 = Vec3.create(obj.normals[normalindex0][0], obj.normals[normalindex0][1], obj.normals[normalindex0][2]);
                var normal1 = Vec3.create(obj.normals[normalindex1][0], obj.normals[normalindex1][1], obj.normals[normalindex1][2]);
                var normal2 = Vec3.create(obj.normals[normalindex2][0], obj.normals[normalindex2][1], obj.normals[normalindex2][2]);
                normals.set(normal0, trianglecount * 9);
                normals.set(normal1, trianglecount * 9 + 3);
                normals.set(normal2, trianglecount * 9 + 6);
                trianglecount++;
            }
        }
        saveMtlInfo();
        return new GlObject(vertices, normals, uvs, mtlInfos);
    };
    return ObjLoader;
})();
var Obj = (function () {
    function Obj(vertices, uvs, normals, faces) {
        this.vertices = vertices;
        this.uvs = uvs;
        this.normals = normals;
        this.faces = faces;
    }
    return Obj;
})();
var Material = (function () {
    function Material() {
    }
    return Material;
})();
var MtlInfo = (function () {
    function MtlInfo(endPos, ambient, diffuse, specular, shininess, texture) {
        this.endPos = endPos;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
        this.texture = texture;
    }
    return MtlInfo;
})();
var GlObject = (function () {
    function GlObject(vertices, normals, uvs, mtlInfos) {
        this.vertices = vertices;
        this.normals = normals;
        this.uvs = uvs;
        this.mtlInfos = mtlInfos;
    }
    return GlObject;
})();
var FACE = (function () {
    function FACE() {
        this.vertexindex = [];
        this.uvindex = [];
        this.normalindex = [];
    }
    return FACE;
})();
