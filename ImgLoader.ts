/// <reference path="./TgaLoader.ts"/>
/// <reference path="./app.ts"/>

class ImgLoader {
  public static images: {[key: string]: HTMLCanvasElement} ={};
  static load(texturename: string): void{
    if(ImgLoader.images[texturename]){
      return;
    }
    var ext: string = texturename.split(".").pop().toLowerCase();
    if(ext == "tga"){
      ImgLoader.images[texturename] = TgaLoader.load(file.tgasource);
    }else{
      var img: HTMLImageElement = document.createElement('img');
      img.src = texturename;
      img.onload = function(){
        var size: number=1;
        while(img.width > size || img.height > size){
          size *= 2;
        }
        var canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = canvas.height = size;
        var canvasContext:CanvasRenderingContext2D= canvas.getContext('2d');
        canvasContext.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
        ImgLoader.images[texturename] = canvas;
      }
    }
  }
}
