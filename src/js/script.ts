import "../css/style.scss";
import "../css/style_radio.scss";


function downloadCardImage() {
  var canvas = <HTMLCanvasElement>document.getElementById('canvas');
  if (canvas != null) {
    //アンカータグを作成
    var a = document.createElement('a');
    //canvasをJPEG変換し、そのBase64文字列をhrefへセット
    a.href = canvas.toDataURL('image/png');
    //ダウンロード時のファイル名を指定
    let date = new Date();
    let filename = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    a.download = `${filename}.png`;
    //クリックイベントを発生させる
    a.click();
  }
}

function genereteCardImage() {
  if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check1")[0]
  )).checked) {
    // var $fontFamily = "sans-serif";
    // document.getElementsByClassName("js_monthLabel")[0].innerHTML = $fontFamily;
    var obj = (<HTMLInputElement>(document.getElementById("displaytext")));
    obj.style.fontFamily = "M PLUS Rounded 1c";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check2")[0]
  )).checked) {
    var obj = (<HTMLInputElement>(document.getElementById("displaytext")));
    obj.style.fontFamily = "Noto Sans JP";

  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check3")[0]
  )).checked) {
    var obj = (<HTMLInputElement>(document.getElementById("displaytext")));
    obj.style.fontFamily = 'lineseed';

  }

  document.getElementsByClassName("js_monthLabel")[0].innerHTML = (<HTMLInputElement>(
    document.getElementsByClassName("js_input-text")[0]
  )).value;
}

/*
 * @author phi_jp
 */

window.onload = function () {
  var canvas = <HTMLCanvasElement>document.getElementById("canvas");
  var context = canvas.getContext("2d");
  if (context !== null) {
    //background color
    context.beginPath();
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = '700 14px "M PLUS Rounded 1c"';
    context.fillStyle = 'black';
    var text = "あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら";
    tategaki(context, text, 200, 50);
  }
};

var tategaki = function (context: CanvasRenderingContext2D, text: string, x: number, y: number) {
  var textList = text.split('\n');
  var lineHeight = context.measureText("あ").width;
  textList.forEach(function (elm, i) {
    var chk = chkRotate(elm);
    Array.prototype.forEach.call(elm, function (ch, j) {
      if (chk) {
        // パスをリセット
        context.beginPath();
        // 回転 (50度)
        context.translate(x - lineHeight * i, y + lineHeight * j);
        context.rotate(50 * Math.PI / 180);
        context.translate(-(x - lineHeight * i), -(y + lineHeight * j));
      }
      context.fillText(ch, x - lineHeight * i, y + lineHeight * j);
      if (chk) {
        // 回転 (50度)
        context.translate(x - lineHeight * i, y + lineHeight * j);
        context.rotate(-50 * Math.PI / 180);
        context.translate(-(x - lineHeight * i), -(y + lineHeight * j));
      }
    });
  });
};

var chkRotate = function (text: string) {
  if (text == "ー")
    return 1;
  return 0;
};

// document
//   .getElementsByClassName("js_generateButton")[0]
//   .addEventListener("click", (event) => {
//     genereteCardImage();
//   });
// document
//   .getElementsByClassName("js_downloadButton")[0]
//   .addEventListener("click", (event) => {
//     downloadCardImage();
//   });

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementsByClassName("js_generateButton")[0]
    .addEventListener("click", (event) => {
      genereteCardImage();
    });
  document
    .getElementsByClassName("js_downloadButton")[0]
    .addEventListener("click", (event) => {
      downloadCardImage();
    });
});
