var Vec3 = (function () {
    function Vec3() {
    }
    Vec3.create = function (x, y, z) {
        var tmp = new Float32Array(3);
        tmp[0] = x;
        tmp[1] = y;
        tmp[2] = z;
        return tmp;
    };
    return Vec3;
})();
var Vec2 = (function () {
    function Vec2() {
    }
    Vec2.create = function (x, y) {
        var tmp = new Float32Array(2);
        tmp[0] = x;
        tmp[1] = y;
        return tmp;
    };
    return Vec2;
})();
