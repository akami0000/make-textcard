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

class charPosition {
  // プロパティ
  angle: number;
  transPosX: number;
  transPosY: number;
  drawPosX: number;
  drawPosY: number;

  // コンストラクタ
  constructor(angle: number, transPosX: number, transPosY: number, drawPosX: number, drawPosY: number) {
    this.angle = angle;
    this.transPosX = transPosX;
    this.transPosY = transPosY;
    this.drawPosX = drawPosX;
    this.drawPosY = drawPosY;
  }
}
const kotobagaki: string = "詞書：";

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



function chkRotate(text: string, width: number): charPosition {
  const nums: number[] = [];

  //無視した記号　→ ¡¿¥℉℃™€‰※‹µ¤∆¶÷×±»«›‡†№§°π√‾≠≒≡≦≧⊂⊃⊆⊇∈∋∪∩⇒⇔
  if (text.match(/[0-9a-zA-Z]/)) {
    nums.push(90);
    nums.push(0);
    nums.push(2);
    nums.push(-0.8 * width);
    nums.push(0);
    return new charPosition(90, 0, 2, -0.8 * width, 0);
  }
  {
    var kigou = "ー〜～（）=_;~|><}{][＜＞…‥：；｜「」【】『』［］−―／＼";
    if (kigou.indexOf(text) !== -1)
      return new charPosition(90, 0, 2, -width, 0);
  }
  {
    var kigou = "、。，．";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(180, 0, 2, -width, 0.8 * width);
    }
  }
  {
    var kigou = "!";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(0, 0, 0, 0.3 * width, 0);
    }
  }
  {
    var kigou = "+";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(0, 0, 0, 0.1 * width, 0);
    }
  }
  {
    var kigou = "-＝";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 0, 0, -width, -0.1 * width);
    }
  }
  {
    var kigou = "(";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 1, 2, -0.5 * width, -0.1 * width);
    }
  }
  {
    var kigou = ")";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 1, 2, -0.75 * width, -0.1 * width);
    }
  }
  {
    var kigou = ":";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 1, 2, -0.5 * width, -0.1 * width);
    }
  }
  {
    var kigou = "·\“\'`”‘’";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(0, 0, 0, 0.3 * width, 0);
    }
  }
  {
    var kigou = "/\\＿";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 0, 2, -0.8 * width, -0.1 * width);
    }
  }
  return new charPosition(0, 0, 0, 0, 0);
};

function isIncludeStr(str: string, t: string): boolean {
  var s = str;

  if (t.indexOf(s) !== -1) {
    return true;
  }
  else
    return false;
};

function fontSetting(context: CanvasRenderingContext2D, mode: number) {

  var fontText = "";

  // タイトル
  if (mode == 0)
    fontText += "400 60px "
  // 文字
  else if (mode == 1)
    fontText += "400 48px "
  // 付記・詞書
  else
    fontText += "400 36px ";

  if (context !== null) {
    context.font = check2fontname(fontText);
  }

  // Canvasの文字色設定
  // context.fillStyle = getSelectedColor(1);
};

function drawCanvas() {
  changeCanvasSize();

  var canvas = <HTMLCanvasElement>document.getElementById("canvas");
  var context = canvas.getContext("2d");
  if (context !== null) {

    var color = getSelectedCanvasColor();

    //background color
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);

    var fontText = "";
    (<HTMLInputElement>(document.getElementsByClassName("js_display")[0])).style.fontFamily = check2fontname(fontText);

    var title = (<HTMLInputElement>(
      document.getElementsByClassName("js_input-text")[0]
    )).value;

    var text = (<HTMLInputElement>(
      document.getElementsByClassName("js_input-text")[1]
    )).value;

    var note1 = (<HTMLInputElement>(
      document.getElementsByClassName("js_input-text")[2]
    )).value;

    tategaki(context, title, text, note1, canvas.width, canvas.height);
  }
};

var tategaki = function (context: CanvasRenderingContext2D, title: string, text: string, note1: string, x: number, y: number) {

  // タイトル出力
  {
    var titleList = title.split('\n');
    // フォント設定
    fontSetting(context, 0);

    var lineWidth = context.measureText("あ").width;

    // タイトル
    titleList.forEach(function (elm, i) {
      const text: string = elm;
      let start_index_1: number = -1;
      let start_index_2: number = -1;

      for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        if (char === '*') {
          if (text.substring(i, i + 3) === '***') {
            if (start_index_1 === -1) {
              start_index_1 = i;
            } else {
              start_index_2 = i;
              break;
            }
          }
        }
      }

      if (start_index_1 != -1)
        elm = elm.replace(/\*/g, "");

      if (start_index_2 != -1)
        start_index_2 -= 4;


      Array.prototype.forEach.call(elm, function (ch, j) {

        // Canvasの文字色設定
        if (start_index_1 == -1 || (j < start_index_1) || (start_index_2 != -1 && start_index_2 < j)) {
          context.fillStyle = getSelectedMainStrColor();
        }
        else {
          context.fillStyle = getSelectedSubStrColor();
        }

        var drawX = x * 0.9;
        // var drawY = y * 0.3;
        // Canvasの横サイズ・文章の長さによる描画開始位置Yの調整調整（詞書は除く）
        var num = elm.length;

        var drawY = ((y - (lineWidth * (num - 0))) / 2) + (lineWidth);


        var charPos = chkRotate(ch, lineWidth);
        // パスをリセット
        context.beginPath();
        // 回転 (n度)
        context.translate((drawX - lineWidth * i + charPos.transPosX), (drawY + (lineWidth * j + charPos.transPosY)));
        context.rotate(charPos.angle * Math.PI / 180);
        context.translate(-(drawX - lineWidth * i + charPos.transPosX), -(drawY + (lineWidth * j + charPos.transPosY)));

        context.fillText(ch, drawX - lineWidth * i + charPos.drawPosX, drawY + lineWidth * j + charPos.drawPosY);

        // 回転 (n度)
        context.translate((drawX - lineWidth * i + charPos.transPosX), (drawY + (lineWidth * j + charPos.transPosY)));
        context.rotate(-charPos.angle * Math.PI / 180);
        context.translate(-(drawX - lineWidth * i + charPos.transPosX), -(drawY + (lineWidth * j + charPos.transPosY)));
      });
    });
  }

  // 付記1出力
  {
    var noteList = note1.split('\n');
    // フォント設定
    fontSetting(context, 2);

    var lineWidth = context.measureText("あ").width;


    noteList.forEach(function (elm, i) {
      var drawX = x * 0.5 - 600;
      var drawY = y * 0.95;
      context.fillText(elm, drawX, drawY);
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
    var text = "";
    textList.forEach(function (elm, i) {
      if (!isIncludeStr(kotobagaki, elm)) {
        if (num == 0) {
          text = textList[i];
        }
      }
    });
    if (num == 0) {
      text = textList[0];
      if (isIncludeStr(kotobagaki, text))
        text = text.replace("詞書：", "");
    }
    if (isIncludeStr("***", text))
      text = text.replace(/\*/g, "");


    var startY = ((y - (lineWidth * (text.length - 0))) / 2) + (lineWidth);

    textList.forEach(function (elm, i) {

      const text: string = elm;
      let start_index_1: number = -1;
      let start_index_2: number = -1;

      for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        if (char === '*') {
          if (text.substring(i, i + 3) === '***') {
            if (start_index_1 === -1) {
              start_index_1 = i;
            } else {
              start_index_2 = i;
              break;
            }
          }
        }
      }

      if (start_index_1 != -1)
        elm = elm.replace(/\*/g, "");

      if (start_index_2 != -1)
        start_index_2 -= 4;

      console.log(start_index_1 + "test" + start_index_2);

      // 詞書
      if (isIncludeStr(kotobagaki, text)) {
        // フォント設定
        fontSetting(context, 2);

        if (start_index_1 != -1) {
          start_index_1 -= 3;
          start_index_2 -= 3;
        }

        var lineWidth2 = context.measureText("あ").width;

        elm = elm.replace("詞書：", "");

        Array.prototype.forEach.call(elm, function (ch, j) {

          // Canvasの文字色設定
          console.log(start_index_1 + "te" + start_index_2);


          if (start_index_1 == -1 || (j < start_index_1) || (start_index_2 != -1 && start_index_2 < j)) {
            context.fillStyle = getSelectedMainStrColor();
          }
          else {
            context.fillStyle = getSelectedSubStrColor();
          }

          var charPos = chkRotate(ch, lineWidth);
          // パスをリセット
          context.beginPath();
          // 回転 (n度)
          context.translate((startX - lineWidth2 * i + charPos.transPosX), (startY + (lineWidth2 * j + charPos.transPosY)));
          context.rotate(charPos.angle * Math.PI / 180);
          context.translate(-(startX - lineWidth2 * i + charPos.transPosX), -(startY + (lineWidth2 * j + charPos.transPosY)));

          context.fillText(ch, startX - lineWidth * i + charPos.drawPosX, startY + lineWidth2 * j + charPos.drawPosY);

          // 回転 (n度)
          context.translate((startX - lineWidth2 * i + charPos.transPosX), (startY + (lineWidth2 * j + charPos.transPosY)));
          context.rotate(-charPos.angle * Math.PI / 180);
          context.translate(-(startX - lineWidth2 * i + charPos.transPosX), -(startY + (lineWidth2 * j + charPos.transPosY)));
        });
      }
      // ふつうの短歌
      else {
        // フォント設定
        fontSetting(context, 1);

        var lineWidth2 = context.measureText("あ").width;

        Array.prototype.forEach.call(elm, function (ch, j) {

          // Canvasの文字色設定
          if (start_index_1 == -1 || (j < start_index_1) || (start_index_2 != -1 && start_index_2 < j)) {
            context.fillStyle = getSelectedMainStrColor();
          }
          else {
            context.fillStyle = getSelectedSubStrColor();
          }

          var charPos = chkRotate(ch, lineWidth2);

          // パスをリセット
          context.beginPath();
          // 回転 (n度)
          context.translate((startX - lineWidth2 * i + charPos.transPosX), (startY + (lineWidth2 * j + charPos.transPosY)));
          context.rotate(charPos.angle * Math.PI / 180);
          context.translate(-(startX - lineWidth2 * i + charPos.transPosX), -(startY + (lineWidth2 * j + charPos.transPosY)));

          context.fillText(ch, startX - lineWidth * i + charPos.drawPosX, startY + lineWidth2 * j + charPos.drawPosY);

          // 回転 (n度)
          context.translate((startX - lineWidth2 * i + charPos.transPosX), (startY + (lineWidth2 * j + charPos.transPosY)));
          context.rotate(-charPos.angle * Math.PI / 180);
          context.translate(-(startX - lineWidth2 * i + charPos.transPosX), -(startY + (lineWidth2 * j + charPos.transPosY)));
        });
      }
    });
  }

};

function check2fontname(a: string): string {

  var b = a;
  if ((<HTMLInputElement>(
    document.getElementsByClassName("roundedmplus1c")[0]
  )).checked) {
    b += "\"M PLUS Rounded 1c\"";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("notosansjapanese")[0]
  )).checked) {
    b += "\"Noto Sans JP\"";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("lineseed")[0]
  )).checked) {
    b += "\'lineseed\'";
  }

  else if ((<HTMLInputElement>(
    document.getElementsByClassName("rocknroll")[0]
  )).checked) {
    b += "\'RocknRoll One\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("zenAntique")[0]
  )).checked) {
    b += "\'Zen Antique\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("kiwiMaru")[0]
  )).checked) {
    b += "\'Kiwi Maru\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("mochiyPop")[0]
  )).checked) {
    b += "\'Mochiy Pop One\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("dotGothic16")[0]
  )).checked) {
    b += "\'DotGothic16\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("kaiseiDecol")[0]
  )).checked) {
    b += "\'Kaisei Decol\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("zenKurenaido")[0]
  )).checked) {
    b += "\'Zen Kurenaido\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("yuseiMagic")[0]
  )).checked) {
    b += "\'Yusei Magic\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("delaGothicOne")[0]
  )).checked) {
    b += "\'Dela Gothic One\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("hachiMaruPop")[0]
  )).checked) {
    b += "\'Hachi Maru Pop\'";
  }


  else if ((<HTMLInputElement>(
    document.getElementsByClassName("zenKakuGothicNew")[0]
  )).checked) {
    b += "\'Zen Kaku Gothic New\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("ShipporiMincho")[0]
  )).checked) {
    b += "\'Shippori Mincho\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("PottaOne")[0]
  )).checked) {
    b += "\'Potta One\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("KleeOne")[0]
  )).checked) {
    b += "\'Klee One\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("Stick")[0]
  )).checked) {
    b += "\'Stick\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("HinaMincho")[0]
  )).checked) {
    b += "\'Hina Mincho\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("SawarabiMincho")[0]
  )).checked) {
    b += "\'Sawarabi Mincho\'";
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("SawarabiGothic")[0]
  )).checked) {
    b += "\'Sawarabi Gothic\'";
  }
  return b;
};


function changeCanvasSize() {
  var canvas = document.getElementById('canvas');
  if (!canvas) return;

  if ((<HTMLInputElement>(
    document.getElementsByClassName("yokonaga1")[0]
  )).checked) {
    canvas.setAttribute("width", "1500");
    canvas.setAttribute("height", "2000");
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("masikaku")[0]
  )).checked) {
    canvas.setAttribute("width", "2000");
    canvas.setAttribute("height", "2000");
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("matiuke")[0]
  )).checked) {
    canvas.setAttribute("width", "2000");
    canvas.setAttribute("height", "4000");
  }
};

function getSelectedCanvasColor(): string {
  var color = "";

  if ((<HTMLInputElement>(
    document.getElementsByClassName("c_siro")[0]
  )).checked) {
    color = '#ffffff';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("c_koniro")[0]
  )).checked) {
    color = '#223a70';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("c_aiiro")[0]
  )).checked) {
    color = '#165e83';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("c_enjiiro")[0]
  )).checked) {
    color = '#b94047';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("c_fujiiro")[0]
  )).checked) {
    color = '#bbbcde';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("c_azukiiro")[0]
  )).checked) {
    color = '#96514d';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("c_sakurairo")[0]
  )).checked) {
    color = '#fef4f4';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("c_momoiro")[0]
  )).checked) {
    color = '#f09199';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("c_nezumiiro")[0]
  )).checked) {
    color = '#949495';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("c_syuiro")[0]
  )).checked) {
    color = '#ba2636';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("c_kuro")[0]
  )).checked) {
    color = '#000000';
  }

  return color;
};

function getSelectedMainStrColor(): string {
  var color = "";

  if ((<HTMLInputElement>(
    document.getElementsByClassName("main_siro")[0]
  )).checked) {
    color = '#ffffff';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("main_koniro")[0]
  )).checked) {
    color = '#223a70';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("main_aiiro")[0]
  )).checked) {
    color = '#165e83';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("main_enjiiro")[0]
  )).checked) {
    color = '#b94047';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("main_fujiiro")[0]
  )).checked) {
    color = '#bbbcde';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("main_azukiiro")[0]
  )).checked) {
    color = '#96514d';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("main_sakurairo")[0]
  )).checked) {
    color = '#fef4f4';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("main_momoiro")[0]
  )).checked) {
    color = '#f09199';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("main_nezumiiro")[0]
  )).checked) {
    color = '#949495';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("main_syuiro")[0]
  )).checked) {
    color = '#ba2636';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("main_kuro")[0]
  )).checked) {
    color = '#000000';
  }

  return color;
};

function getSelectedSubStrColor(): string {
  var color = "";

  if ((<HTMLInputElement>(
    document.getElementsByClassName("sub_siro")[0]
  )).checked) {
    color = '#ffffff';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("sub_koniro")[0]
  )).checked) {
    color = '#223a70';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("sub_aiiro")[0]
  )).checked) {
    color = '#165e83';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("sub_enjiiro")[0]
  )).checked) {
    color = '#b94047';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("sub_fujiiro")[0]
  )).checked) {
    color = '#bbbcde';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("sub_azukiiro")[0]
  )).checked) {
    color = '#96514d';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("sub_sakurairo")[0]
  )).checked) {
    color = '#fef4f4';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("sub_momoiro")[0]
  )).checked) {
    color = '#f09199';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("sub_nezumiiro")[0]
  )).checked) {
    color = '#949495';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("sub_syuiro")[0]
  )).checked) {
    color = '#ba2636';
  }
  else if ((<HTMLInputElement>(
    document.getElementsByClassName("sub_kuro")[0]
  )).checked) {
    color = '#000000';
  }

  return color;
};

function insertText() {
  var text = (<HTMLInputElement>(
    document.getElementsByClassName("js_input-text")[1]
  )).value;

  text += "\n詞書：";

  (<HTMLInputElement>(
    document.getElementsByClassName("js_input-text")[1]
  )).value = text;
}


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
    .getElementsByClassName("js_generateButton")[2]
    .addEventListener("click", (event) => {
      genereteCardImage();
    });
  document
    .getElementsByClassName("js_downloadButton")[0]
    .addEventListener("click", (event) => {
      downloadCardImage();
    });
  document
    .getElementsByClassName("js_insertButton")[0]
    .addEventListener("click", (event) => {
      insertText();
    });

  // document.getElementsByClassName("js_tweetButton")[0]
  //   .addEventListener("click", (event) => {
  //     tweet();
  //   });
});
