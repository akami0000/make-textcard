import "../css/style.scss";
import "../css/style_radio.scss";

// // ツイートボタン押下時にテキストを動的に変更してツイート
// function tweet() {
//   // 出力結果を取得
//   var text = (<HTMLInputElement>(
//     document.getElementsByClassName("js_input-text")[0]
//   )).value;

//   // オプションパラメータを設定
//   let hashtags = "縦書き画像メーカー";
//   let url = "https://make-textcard.netlify.app/";  // location.hrefは今いるURL

//   // URLを生成して遷移
//   window.open("https://twitter.com/share?text=" + text + "&hashtags=" + hashtags + "&url=" + url);
// }

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

var tategaki = function (context: CanvasRenderingContext2D, title: string, text: string, x: number, y: number) {

  // タイトル出力
  {
    var titleList = title.split('\n');
    // フォント設定
    fontSetting(context, 0);

    var lineWidth = context.measureText("あ").width;

    // タイトル
    titleList.forEach(function (elm, i) {
      Array.prototype.forEach.call(elm, function (ch, j) {
        var drawX = x - 80;
        var drawY = y - 600;

        var rotate = chkRotate(ch, lineWidth);
        // パスをリセット
        context.beginPath();
        // 回転 (n度)
        context.translate((drawX - lineWidth * i + rotate[1]), (drawY + (lineWidth * j + rotate[2])));
        context.rotate(rotate[0] * Math.PI / 180);
        context.translate(-(drawX - lineWidth * i + rotate[1]), -(drawY + (lineWidth * j + rotate[2])));

        context.fillText(ch, drawX - lineWidth * i + rotate[3], drawY + lineWidth * j + rotate[4]);

        // 回転 (n度)
        context.translate((drawX - lineWidth * i + rotate[1]), (drawY + (lineWidth * j + rotate[2])));
        context.rotate(-rotate[0] * Math.PI / 180);
        context.translate(-(drawX - lineWidth * i + rotate[1]), -(drawY + (lineWidth * j + rotate[2])));
      });
    });
  }

  // 本文出力
  {
    var textList = text.split('\n');

    // フォント設定
    fontSetting(context, 1);

    var lineWidth = context.measureText("あ").width;
    var lineHeight = context.measureText("あ").actualBoundingBoxAscent
      + context.measureText("あ").actualBoundingBoxDescent;

    // Canvasの縦サイズ・文章の行数による描画開始位置Xの調整
    var startX = x / 2 - (lineWidth) + (textList.length * lineWidth) / 2;

    // Canvasの横サイズ・文章の長さによる描画開始位置Yの調整調整（詞書は除く）
    var num = 0;
    textList.forEach(function (elm, i) {
      if (!isIncludeKotobagaki(elm)) {
        if (num == 0)
          num = textList[i].length;
      }
    });
    if (num == 0)
      num = textList[0].length;

    var startY = ((y - (lineWidth * (num - 0))) / 2) + (lineWidth);

    textList.forEach(function (elm, i) {
      // 詞書
      if (isIncludeKotobagaki(elm)) {
        // フォント設定
        fontSetting(context, 2);

        var lineWidth2 = context.measureText("あ").width;

        elm = elm.replace("詞書：", "");

        Array.prototype.forEach.call(elm, function (ch, j) {
          var rotate = chkRotate(ch, lineWidth);
          // パスをリセット
          context.beginPath();
          // 回転 (n度)
          context.translate((startX - lineWidth2 * i + rotate[1]), (startY + (lineWidth2 * j + rotate[2])));
          context.rotate(rotate[0] * Math.PI / 180);
          context.translate(-(startX - lineWidth2 * i + rotate[1]), -(startY + (lineWidth2 * j + rotate[2])));

          context.fillText(ch, startX - lineWidth * i + rotate[3], startY + lineWidth2 * j + rotate[4]);

          // 回転 (n度)
          context.translate((startX - lineWidth2 * i + rotate[1]), (startY + (lineWidth2 * j + rotate[2])));
          context.rotate(-rotate[0] * Math.PI / 180);
          context.translate(-(startX - lineWidth2 * i + rotate[1]), -(startY + (lineWidth2 * j + rotate[2])));
        });
      }
      // ふつうの短歌
      else {
        // フォント設定
        fontSetting(context, 1);

        var lineWidth2 = context.measureText("あ").width;

        Array.prototype.forEach.call(elm, function (ch, j) {
          var rotate = chkRotate(ch, lineWidth2);
          // パスをリセット
          context.beginPath();
          // 回転 (n度)
          context.translate((startX - lineWidth2 * i + rotate[1]), (startY + (lineWidth2 * j + rotate[2])));
          context.rotate(rotate[0] * Math.PI / 180);
          context.translate(-(startX - lineWidth2 * i + rotate[1]), -(startY + (lineWidth2 * j + rotate[2])));

          context.fillText(ch, startX - lineWidth * i + rotate[3], startY + lineWidth * j + rotate[4]);

          // 回転 (n度)
          context.translate((startX - lineWidth2 * i + rotate[1]), (startY + (lineWidth2 * j + rotate[2])));
          context.rotate(-rotate[0] * Math.PI / 180);
          context.translate(-(startX - lineWidth2 * i + rotate[1]), -(startY + (lineWidth2 * j + rotate[2])));
        });
      }
    });
  }

};

function chkRotate(text: string, width: number): number[] {
  const nums: number[] = [];
  // nums[0]   // 角度
  // nums[1]   // 回転位置Xの調整値
  // nums[2]   // 回転位置Yの調整値
  // nums[3]   // 描画位置Xの調整値
  // nums[4]   // 描画位置Yの調整値

  //無視した記号　→ ¡¿¥℉℃™€‰※‹µ¤∆¶÷×±»«›‡†№§°π√‾≠≒≡≦≧⊂⊃⊆⊇∈∋∪∩⇒⇔
  var hankaku = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  if (hankaku.indexOf(text) !== -1) {
    nums.push(90);
    nums.push(0);
    nums.push(2);
    nums.push(0.8);
    nums.push(0);
  }
  else if (text === "ー"
    || text === "〜"
    || text === "～"
    || text === "（"
    || text === "）"
    || text === "="
    || text === "_"
    || text === ";"
    || text === "~"
    || text === "|"
    || text === ">"
    || text === "<"

    || text === "}"
    || text === "{"
    || text === "]"
    || text === "["
    || text === "＜"
    || text === "＞"

    || text === "…"
    || text === "‥"

    || text === "："
    || text === "；"
    || text === "｜"


    || text === "「"
    || text === "」"
    || text === "【"
    || text === "】"
    || text === "『"
    || text === "』"
    || text === "［"
    || text === "］"

    || text === "−"
    || text === "―"
    || text === "／"
    || text === "＼"
  ) {
    nums.push(90);
    nums.push(0);
    nums.push(2);
    nums.push(-width);
    nums.push(0);
  }
  else if (text === "、" || text === "。" || text === "，" || text === "．") {
    nums.push(180);
    nums.push(0);
    nums.push(2);
    nums.push(-width);
    nums.push(width);
  }
  else if (text === "!") {
    nums.push(0);
    nums.push(0);
    nums.push(0);
    nums.push(0.3 * width);
    nums.push(0);
  }
  else if (text === "+") {
    nums.push(0);
    nums.push(0);
    nums.push(0);
    nums.push(0.1 * width);
    nums.push(0);
  }
  else if (text === "-" || text === "＝") {
    nums.push(90);
    nums.push(0);
    nums.push(0);
    nums.push(-width);
    nums.push(-0.1 * width);
  }
  else if (text === "(") {
    nums.push(90);
    nums.push(1);
    nums.push(2);
    nums.push(-0.5 * width);
    nums.push(0);
  }
  else if (text === ")") {
    nums.push(90);
    nums.push(1);
    nums.push(2);
    nums.push(-0.75 * width);
    nums.push(0);
  }
  else if (text === ":") {
    nums.push(90);
    nums.push(1);
    nums.push(2);
    nums.push(-0.6 * width);
    nums.push(0);
  }
  else if (text === "·" || text === "\“" || text === "\'" || text === "`" || text === "”" || text === "‘" || text === "’") {
    nums.push(0);
    nums.push(0);
    nums.push(0);
    nums.push(0.3 * width);
    nums.push(0);
  }
  else if (text === "/" || text === "\\" || text === "＿") {
    nums.push(90);
    nums.push(0);
    nums.push(2);
    nums.push(-0.8 * width);
    nums.push(0);
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

function countLength(tex: string): number {
  var list = tex.split('\n');
  var number = 0;
  list.forEach(function (elm, i) {
    if (!isIncludeKotobagaki(elm)) {
      return list[i].length;
    }
  });
  return list[0].length;
};

function isIncludeKotobagaki(t: string): boolean {
  var kotobagaki = "詞書：";

  if (t.indexOf(kotobagaki) !== -1) {
    return true;
  }
  else
    return false;
};

function fontSetting(context: CanvasRenderingContext2D, mode: number) {

  var fontText = "";

  if (mode == 0)
    fontText += "400 24px "
  else if (mode == 1)
    fontText += "400 16px "
  else
    fontText += "400 12px ";

  if (context !== null) {
    context.font = check2fontname(fontText);
  }

  context.fillStyle = 'black';
};

function drawCanvas() {

  var canvas = <HTMLCanvasElement>document.getElementById("canvas");
  var context = canvas.getContext("2d");
  if (context !== null) {
    //background color
    context.beginPath();
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);


    var fontText = "";
    (<HTMLInputElement>(document.getElementsByClassName("js_display")[0])).style.fontFamily = check2fontname(fontText);

    var title = (<HTMLInputElement>(
      document.getElementsByClassName("js_input-text")[0]
    )).value;

    var text = (<HTMLInputElement>(
      document.getElementsByClassName("js_input-text")[1]
    )).value;

    tategaki(context, title, text, canvas.width, canvas.height);
  }
};

function check2fontname(a: string): string {

  var b = a;
  if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[0]
  )).checked) {
    b += "\"M PLUS Rounded 1c\"";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[1]
  )).checked) {
    b += "\"Noto Sans JP\"";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[2]
  )).checked) {
    b += "\'lineseed\'";
  }

  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[3]
  )).checked) {
    b += "\'RocknRoll One\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[4]
  )).checked) {
    b += "\'Zen Antique\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[5]
  )).checked) {
    b += "\'Kiwi Maru\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[6]
  )).checked) {
    b += "\'Mochiy Pop One\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[7]
  )).checked) {
    b += "\'DotGothic16\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[8]
  )).checked) {
    b += "\'Kaisei Decol\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[9]
  )).checked) {
    b += "\'Zen Kurenaido\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[10]
  )).checked) {
    b += "\'Yusei Magic\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[11]
  )).checked) {
    b += "\'Dela Gothic One\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("js_check")[12]
  )).checked) {
    b += "\'Hachi Maru Pop\'";
  }
  return b;
};


document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementsByClassName("js_generateButton")[0]
    .addEventListener("click", (event) => {
      genereteCardImage();
    });
  document
    .getElementsByClassName("js_generateButton")[1]
    .addEventListener("click", (event) => {
      genereteCardImage();
    });
  document
    .getElementsByClassName("js_downloadButton")[0]
    .addEventListener("click", (event) => {
      downloadCardImage();
    });

  // document.getElementsByClassName("js_tweetButton")[0]
  //   .addEventListener("click", (event) => {
  //     tweet();
  //   });
});
