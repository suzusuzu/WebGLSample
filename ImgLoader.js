/// <reference path="./TgaLoader.ts"/>
/// <reference path="./app.ts"/>
var ImgLoader = (function () {
    function ImgLoader() {
    }
    ImgLoader.load = function (texturename) {
        if (ImgLoader.images[texturename]) {
            return;
        }
        var ext = texturename.split(".").pop().toLowerCase();
        if (ext == "tga") {
            ImgLoader.images[texturename] = TgaLoader.load(file.tgasource);
        }
        else {
            var img = document.createElement('img');
            img.src = texturename;
            img.onload = function () {
                var size = 1;
                while (img.width > size || img.height > size) {
                    size *= 2;
                }
                var canvas = document.createElement('canvas');
                canvas.width = canvas.height = size;
                var canvasContext = canvas.getContext('2d');
                canvasContext.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
                ImgLoader.images[texturename] = canvas;
            };
        }
    };
    ImgLoader.images = {};
    return ImgLoader;
})();
