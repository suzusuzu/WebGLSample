var TgaLoader = (function () {
    function TgaLoader() {
    }
    TgaLoader.load = function (data) {
        var tgaheader = new TgaHeader();
        tgaheader.idFieldLength = data[0];
        tgaheader.colorMapType = data[1];
        tgaheader.type = data[2];
        tgaheader.colorMapOrigin = data[3] | data[4] << 8;
        tgaheader.colorMapLength = data[5] | data[6] << 8;
        tgaheader.colorMapDepth = data[7] | data[8] << 8;
        tgaheader.originX = data[8] | data[9] << 8;
        tgaheader.originY = data[10] | data[11] << 8;
        tgaheader.width = data[12] | data[13] << 8;
        tgaheader.height = data[14] | data[15] << 8;
        tgaheader.depth = data[16];
        tgaheader.descriptor = data[17];
        var offset = 18 + tgaheader.idFieldLength;
        var color_num = tgaheader.depth / 8;
        var size = tgaheader.width * tgaheader.height * 4;
        var canvas = document.createElement('canvas');
        canvas.width = tgaheader.width;
        canvas.height = tgaheader.height;
        var ctx = canvas.getContext('2d');
        var imageData = ctx.createImageData(tgaheader.width, tgaheader.height);
        for (var i = 0; i < size; i += 4) {
            imageData.data[i] = data[offset + 2];
            imageData.data[i + 1] = data[offset + 1];
            imageData.data[i + 2] = data[offset];
            imageData.data[i + 3] = 255;
            offset += color_num;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    };
    return TgaLoader;
})();
var TgaHeader = (function () {
    function TgaHeader() {
    }
    return TgaHeader;
})();
