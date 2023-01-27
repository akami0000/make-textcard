import "../css/style.scss";
import "../css/style_radio.scss";

// ツイートボタン押下時にテキストを動的に変更してツイート
function tweet() {
  // 出力結果を取得
  var text = (<HTMLInputElement>(
    document.getElementsByClassName("js_input-text")[0]
  )).value;

  // オプションパラメータを設定
  let hashtags = "縦書き画像メーカー";
  let url = encodeURIComponent(location.href)  // location.hrefは今いるURL

  // URLを生成して遷移
  window.open("https://twitter.com/share?text=" + text + "&hashtags=" + hashtags + "&url=" + url);
}

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
  drawCanvas();
}

/*
 * @author phi_jp
 */

window.onload = function () {
  drawCanvas();
};

var tategaki = function (context: CanvasRenderingContext2D, text: string, x: number, y: number) {
  var textList = text.split('\n');
  var lineHeight = context.measureText("あ").width;

  // Canvasの縦サイズ・文章の長さによる描画開始位置Xの調整
  var drawX = x / 2 - (lineHeight / 2);

  // Canvasの横サイズ描画開始位置Yの調整
  var drawY = ((y - (lineHeight * (textList[0].length - 0))) / 2) + (lineHeight);

  // console.log();

  textList.forEach(function (elm, i) {
    Array.prototype.forEach.call(elm, function (ch, j) {
      var rotate = chkRotate(ch);
      // パスをリセット
      context.beginPath();
      // 回転 (n度)
      context.translate((drawX - lineHeight * i + rotate[1]), (drawY + (lineHeight * j + rotate[2])));
      context.rotate(rotate[0] * Math.PI / 180);
      context.translate(-(drawX - lineHeight * i + rotate[1]), -(drawY + (lineHeight * j + rotate[2])));

      context.fillText(ch, drawX - lineHeight * (i + rotate[3]), drawY + lineHeight * (j + rotate[4]));

      // 回転 (n度)
      context.translate((drawX - lineHeight * i + rotate[1]), (drawY + (lineHeight * j + rotate[2])));
      context.rotate(-rotate[0] * Math.PI / 180);
      context.translate(-(drawX - lineHeight * i + rotate[1]), -(drawY + (lineHeight * j + rotate[2])));
    });
  });

};

function chkRotate(text: string): number[] {
  const nums: number[] = [];
  if (text === "ー" || text === "〜") {
    nums.push(90);  // 角度
    nums.push(0);   // 回転位置Xの調整値
    nums.push(2);   // 回転位置Yの調整値
    nums.push(1);   // 描画位置Xの調整値
    nums.push(0);   // 描画位置Yの調整値
  }
  else if (text === "、" || text === "。") {
    nums.push(180);
    nums.push(0);
    nums.push(2);
    nums.push(1);
    nums.push(1);
  }
  else {
    nums.push(0);
    nums.push(0);
    nums.push(0);
    nums.push(0);
    nums.push(0);
  }
  return nums;
};

function drawCanvas() {

  var canvas = <HTMLCanvasElement>document.getElementById("canvas");
  var context = canvas.getContext("2d");
  if (context !== null) {
    //background color
    context.beginPath();
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    if ((<HTMLInputElement>(
      document.getElementsByClassName("js_check1")[0]
    )).checked) {
      context.font = '400 16px "M PLUS Rounded 1c"';
    }
    else if ((<HTMLInputElement>(
      document.getElementsByClassName("js_check2")[0]
    )).checked) {
      context.font = '400 16px "Noto Sans JP"';
    }
    else if ((<HTMLInputElement>(
      document.getElementsByClassName("js_check3")[0]
    )).checked) {
      context.font = '400 16px "lineseed"';
    }

    context.fillStyle = 'black';
    var text = (<HTMLInputElement>(
      document.getElementsByClassName("js_input-text")[0]
    )).value;
    tategaki(context, text, canvas.width, canvas.height);
  }
};


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

  document.getElementsByClassName("js_tweetButton")[0]
    .addEventListener("click", (event) => {
      tweet();
    });
});
