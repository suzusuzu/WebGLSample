class TgaLoader {

  static load(data: Uint8Array): HTMLCanvasElement{

    var tgaheader: TgaHeader = new TgaHeader();

    tgaheader.idFieldLength = data[0];
    tgaheader.colorMapType = data[1];
    tgaheader.type = data[2];
    tgaheader.colorMapOrigin = data[3] | data[4] << 8;
    tgaheader.colorMapLength= data[5] | data[6]<< 8;
    tgaheader.colorMapDepth= data[7] | data[8] << 8;
    tgaheader.originX= data[8] | data[9] << 8;
    tgaheader.originY= data[10] | data[11] << 8;
    tgaheader.width= data[12]  | data[13]  << 8
    tgaheader.height= data[14]  | data[15]  << 8;
    tgaheader.depth= data[16] ;
    tgaheader.descriptor= data[17];

    var offset: number = 18 + tgaheader.idFieldLength;
    var color_num: number = tgaheader.depth/8;
    var size: number = tgaheader.width * tgaheader.height * 4;

    var canvas:HTMLCanvasElement = document.createElement('canvas');
    canvas.width = tgaheader.width;
    canvas.height = tgaheader.height;
    var ctx:CanvasRenderingContext2D = canvas.getContext('2d');
    var imageData:ImageData = ctx.createImageData(tgaheader.width, tgaheader.height);

    for(var i:number=0;i<size;i+=4){
      imageData.data[i] = data[offset+2];
      imageData.data[i+1] = data[offset+1];
      imageData.data[i+2] = data[offset];
      imageData.data[i+3] = 255;
      offset+=color_num;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
}

class TgaHeader {
  public idFieldLength: number;
  public colorMapType: number;
  public type: number;
  public colorMapOrigin: number;
  public colorMapLength: number;
  public colorMapDepth: number;
  public originX: number;
  public originY: number;
  public width: number;
  public height: number;
  public depth: number;
  public descriptor: number;
}
