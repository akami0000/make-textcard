import "../css/style.scss";
import "../css/style_rocknroll.scss";

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
  constructor(
    angle: number,
    transPosX: number,
    transPosY: number,
    drawPosX: number,
    drawPosY: number,
  ) {
    this.angle = angle;
    this.transPosX = transPosX;
    this.transPosY = transPosY;
    this.drawPosX = drawPosX;
    this.drawPosY = drawPosY;
  }
}
const kotobagaki: string = "詞書：";

function downloadCardImage(): void {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (canvas) {
    //アンカータグを作成
    const a = document.createElement("a");
    //canvasをJPEG変換し、そのBase64文字列をhrefへセット
    a.href = canvas.toDataURL("image/png");
    //ダウンロード時のファイル名を指定
    const date = new Date();
    const filename = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}.png`;
    a.download = filename;
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
    const kigou = "ー〜～（）=_;~|><}{][＜＞…‥：；｜「」【】『』［］−―";
    if (kigou.indexOf(text) !== -1)
      return new charPosition(90, 0, 2, -width, 0);
  }
  {
    const kigou = "／＼";
    if (kigou.indexOf(text) !== -1) return new charPosition(0, 0, 5, 0, 0);
  }
  {
    const kigou = "、。，．";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(180, 0, 2, -width, 0.8 * width);
    }
  }
  {
    const kigou = "!";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(0, 0, 0, 0.3 * width, 0);
    }
  }
  {
    const kigou = "+";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(0, 0, 0, 0.1 * width, 0);
    }
  }
  {
    const kigou = "-＝";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 0, 0, -width, -0.1 * width);
    }
  }
  {
    const kigou = "(";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 1, 2, -0.5 * width, -0.1 * width);
    }
  }
  {
    const kigou = ")";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 1, 2, -0.75 * width, -0.1 * width);
    }
  }
  {
    const kigou = ":";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 1, 2, -0.5 * width, -0.1 * width);
    }
  }
  {
    const kigou = "·“'`”‘’";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(0, 0, 0, 0.3 * width, 0);
    }
  }
  {
    const kigou = "/\\＿";
    if (kigou.indexOf(text) !== -1) {
      return new charPosition(90, 0, 2, -0.8 * width, -0.1 * width);
    }
  }
  return new charPosition(0, 0, 0, 0, 0);
}

function fontSetting(
  context: CanvasRenderingContext2D | null,
  mode: number,
): void {
  let fontText = "";

  switch (mode) {
    // タイトル
    case 0:
      fontText += "400 60px ";
      break;
    // 文字
    case 1:
      fontText += "400 48px ";
      break;
    // 付記・詞書
    case 2:
      fontText += "400 36px ";
      break;
  }

  if (context !== null) {
    context.font = fontText + getCheckedFont();
  }
}

function getCheckedFont(): string {
  const fontInputs = [
    "roundedmplus1c",
    "notosansjapanese",
    "lineseed",
    "rocknroll",
    "zenAntique",
    "kiwiMaru",
    "mochiyPop",
    "dotGothic16",
    "kaiseiDecol",
    "zenKurenaido",
    "yuseiMagic",
    "delaGothicOne",
    "hachiMaruPop",
    "zenKakuGothicNew",
    "ShipporiMincho",
    "PottaOne",
    "KleeOne",
    "Stick",
    "HinaMincho",
    "SawarabiMincho",
    "SawarabiGothic",
  ];
  for (const input of fontInputs) {
    const checkbox = document.querySelector(`.${input}`) as HTMLInputElement;
    if (checkbox.checked) {
      switch (input) {
        case "roundedmplus1c":
          return '"M PLUS Rounded 1c"';
        case "notosansjapanese":
          return '"Noto Sans JP"';
        case "lineseed":
          return "'lineseed'";
        case "rocknroll":
          return "'RocknRoll One'";
        case "zenAntique":
          return "'Zen Antique'";
        case "kiwiMaru":
          return "'Kiwi Maru'";
        case "mochiyPop":
          return "'Mochiy Pop One'";
        case "dotGothic16":
          return "'DotGothic16'";
        case "kaiseiDecol":
          return "'Kaisei Decol'";
        case "zenKurenaido":
          return "'Zen Kurenaido'";
        case "yuseiMagic":
          return "'Yusei Magic'";
        case "delaGothicOne":
          return "'Dela Gothic One'";
        case "hachiMaruPop":
          return "'Hachi Maru Pop'";
        case "zenKakuGothicNew":
          return "'Zen Kaku Gothic New'";
        case "ShipporiMincho":
          return "'Shippori Mincho'";
        case "PottaOne":
          return "'Potta One'";
        case "KleeOne":
          return "'Klee One'";
        case "Stick":
          return "'Stick'";
        case "HinaMincho":
          return "'Hina Mincho'";
        case "SawarabiMincho":
          return "'Sawarabi Mincho'";
        case "SawarabiGothic":
          return "'Sawarabi Gothic'";
      }
    }
  }
  return "";
}

function drawCanvas() {
  changeCanvasSize();

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const color = getSelectedCanvasColor();

  //background color
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const displayElem = document.getElementsByClassName(
    "js_display",
  )[0] as HTMLInputElement;
  displayElem.style.fontFamily = getCheckedFont();

  const title = document.getElementsByClassName(
    "js_input-text",
  )[0] as HTMLInputElement;
  const text = document.getElementsByClassName(
    "js_input-text",
  )[1] as HTMLInputElement;
  const note1 = document.getElementsByClassName(
    "js_input-text",
  )[2] as HTMLInputElement;
  const note2 = document.getElementsByClassName(
    "js_input-text",
  )[3] as HTMLInputElement;

  tategaki(
    context,
    title.value,
    text.value,
    note1.value,
    note2.value,
    canvas.width,
    canvas.height,
  );
}

var tategaki = function (
  context: CanvasRenderingContext2D,
  title: string,
  text: string,
  note1: string,
  note2: string,
  x: number,
  y: number,
) {
  // タイトル出力
  // {
  //   var titleList = title.split("\n");
  //   // フォント設定
  //   fontSetting(context, 0);
  //   var lineWidth = context.measureText("あ").width;

  //   // タイトル
  //   let text: string = titleList[0];
  //   let start_index_1: number = -1;
  //   let start_index_2: number = -1;

  //   for (let i = 0; i < text.length; i++) {
  //     const char = text.charAt(i);
  //     if (char === "*") {
  //       if (text.substring(i, i + 3) === "***") {
  //         if (start_index_1 === -1) {
  //           start_index_1 = i;
  //         } else {
  //           start_index_2 = i - 4;
  //           break;
  //         }
  //       }
  //     }
  //   }

  //   if (text.indexOf("***") !== -1) text = text.replace(/\*/g, "");

  //   Array.prototype.forEach.call(text, function (ch, j) {
  //     // Canvasの文字色設定
  //     if (
  //       start_index_1 == -1 ||
  //       j < start_index_1 ||
  //       (start_index_2 != -1 && start_index_2 < j)
  //     )
  //       context.fillStyle = getSelectedMainStrColor();
  //     else context.fillStyle = getSelectedSubStrColor();

  //     // Xは固定値
  //     var drawX = x * 0.9;
  //     // Canvasの横サイズ・文章の長さによる描画開始位置Yの調整調整（詞書は除く）
  //     var drawY = (y - lineWidth * text.length) / 2 + lineWidth;

  //     var charPos = chkRotate(ch, lineWidth);
  //     // パスをリセット
  //     context.beginPath();
  //     // 回転 (n度)
  //     context.translate(
  //       drawX - lineWidth + charPos.transPosX,
  //       drawY + (lineWidth * j + charPos.transPosY)
  //     );
  //     context.rotate((charPos.angle * Math.PI) / 180);
  //     context.translate(
  //       -(drawX - lineWidth + charPos.transPosX),
  //       -(drawY + (lineWidth * j + charPos.transPosY))
  //     );

  //     context.fillText(
  //       ch,
  //       drawX - lineWidth + charPos.drawPosX,
  //       drawY + lineWidth * j + charPos.drawPosY
  //     );

  //     // 回転 (n度)
  //     context.translate(
  //       drawX - lineWidth + charPos.transPosX,
  //       drawY + (lineWidth * j + charPos.transPosY)
  //     );
  //     context.rotate((-charPos.angle * Math.PI) / 180);
  //     context.translate(
  //       -(drawX - lineWidth + charPos.transPosX),
  //       -(drawY + (lineWidth * j + charPos.transPosY))
  //     );
  //   });
  // }

  // // 付記1出力
  // {
  //   var noteList = note1.split("\n");
  //   // フォント設定
  //   fontSetting(context, 2);
  //   var lineWidth = context.measureText("あ").width;

  //   // タイトル
  //   let text: string = noteList[0];
  //   let start_index_1: number = -1;
  //   let start_index_2: number = -1;

  //   for (let i = 0; i < text.length; i++) {
  //     const char = text.charAt(i);
  //     if (char === "*") {
  //       if (text.substring(i, i + 3) === "***") {
  //         if (start_index_1 === -1) {
  //           start_index_1 = i;
  //         } else {
  //           start_index_2 = i - 4;
  //           break;
  //         }
  //       }
  //     }
  //   }

  //   if (text.indexOf("***") !== -1) text = text.replace(/\*/g, "");

  //   Array.prototype.forEach.call(text, function (ch, j) {
  //     // Canvasの文字色設定
  //     if (
  //       start_index_1 == -1 ||
  //       j < start_index_1 ||
  //       (start_index_2 != -1 && start_index_2 < j)
  //     )
  //       context.fillStyle = getSelectedMainStrColor();
  //     else context.fillStyle = getSelectedSubStrColor();

  //     var drawX = x * 0.05;
  //     var drawY = y * 0.95;
  //     context.fillText(ch, drawX + j * lineWidth, drawY);
  //   });
  // }
  // // 付記2出力
  // {
  //   var noteList = note2.split("\n");
  //   // フォント設定
  //   fontSetting(context, 2);
  //   var lineWidth = context.measureText("あ").width;

  //   // タイトル
  //   let text: string = noteList[0];
  //   let start_index_1: number = -1;
  //   let start_index_2: number = -1;

  //   for (let i = 0; i < text.length; i++) {
  //     const char = text.charAt(i);
  //     if (char === "*") {
  //       if (text.substring(i, i + 3) === "***") {
  //         if (start_index_1 === -1) {
  //           start_index_1 = i;
  //         } else {
  //           start_index_2 = i - 4;
  //           break;
  //         }
  //       }
  //     }
  //   }

  //   if (text.indexOf("***") !== -1) text = text.replace(/\*/g, "");

  //   Array.prototype.forEach.call(text, function (ch, j) {
  //     // Canvasの文字色設定
  //     if (
  //       start_index_1 == -1 ||
  //       j < start_index_1 ||
  //       (start_index_2 != -1 && start_index_2 < j)
  //     )
  //       context.fillStyle = getSelectedMainStrColor();
  //     else context.fillStyle = getSelectedSubStrColor();

  //     var drawX = x * 0.95 - text.length * lineWidth;
  //     var drawY = y * 0.95;
  //     context.fillText(ch, drawX + j * lineWidth, drawY);
  //   });
  // }

  // 本文出力
  // {
  //   var textList = text.split("\n");

  //   // フォント設定
  //   fontSetting(context, 1);
  //   var lineWidth = context.measureText("あ").width;

  //   // Canvasの縦サイズ・文章の行数による描画開始位置Xの調整
  //   var startX = x / 2 - lineWidth + (textList.length * lineWidth) / 2;

  //   // Canvasの横サイズ・文章の長さによる描画開始位置Yの調整調整（詞書は除く）
  //   var text = "";
  //   var maxLength = 0;

  //   textList.forEach(function (elm, i) {
  //     if (elm.indexOf(kotobagaki) === -1) {
  //       text = textList[i];
  //       if (text.indexOf(kotobagaki) !== -1) {
  //         text = text.replace("詞書：", "");
  //       }
  //       if (text.indexOf("***") !== -1) {
  //         text = text.replace(/\*/g, "");
  //       }
  //       if (maxLength < text.length) {
  //         maxLength = text.length;
  //       }
  //     }
  //   });

  //   var startY = (y - lineWidth * (maxLength - 0)) / 2 + lineWidth;

  //   textList.forEach(function (elm, i) {
  //     fontSetting(context, 1);
  //     const text: string = elm;
  //     let start_index_1: number = -1;
  //     let start_index_2: number = -1;

  //     for (let i = 0; i < text.length; i++) {
  //       const char = text.charAt(i);
  //       if (char === "*") {
  //         if (text.substring(i, i + 3) === "***") {
  //           if (start_index_1 === -1) {
  //             start_index_1 = i;
  //           } else {
  //             start_index_2 = i - 4;
  //             break;
  //           }
  //         }
  //       }
  //     }
  //     let lineWidthA = lineWidth;

  //     if (start_index_1 != -1) elm = elm.replace(/\*/g, "");

  //     if (text.indexOf(kotobagaki) !== -1) {
  //       // 詞書用フォント設定
  //       fontSetting(context, 2);
  //       elm = elm.replace("詞書：", "");
  //       lineWidthA = context.measureText("あ").width;
  //       if (start_index_1 != -1) {
  //         start_index_1 -= 3;
  //         start_index_2 -= 3;
  //       }
  //     }

  //     Array.prototype.forEach.call(elm, function (ch, j) {
  //       // Canvasの文字色設定
  //       if (
  //         start_index_1 == -1 ||
  //         j < start_index_1 ||
  //         (start_index_2 != -1 && start_index_2 < j)
  //       ) {
  //         context.fillStyle = getSelectedMainStrColor();
  //       } else {
  //         context.fillStyle = getSelectedSubStrColor();
  //       }

  //       var charPos = chkRotate(ch, lineWidthA);
  //       // パスをリセット
  //       context.beginPath();
  //       // 回転 (n度)
  //       context.translate(
  //         startX - lineWidthA * i + charPos.transPosX,
  //         startY + (lineWidthA * j + charPos.transPosY)
  //       );
  //       context.rotate((charPos.angle * Math.PI) / 180);
  //       context.translate(
  //         -(startX - lineWidthA * i + charPos.transPosX),
  //         -(startY + (lineWidthA * j + charPos.transPosY))
  //       );

  //       context.fillText(
  //         ch,
  //         startX - lineWidthA * i + charPos.drawPosX,
  //         startY + lineWidthA * j + charPos.drawPosY
  //       );

  //       // 回転 (n度)
  //       context.translate(
  //         startX - lineWidthA * i + charPos.transPosX,
  //         startY + (lineWidthA * j + charPos.transPosY)
  //       );
  //       context.rotate((-charPos.angle * Math.PI) / 180);
  //       context.translate(
  //         -(startX - lineWidthA * i + charPos.transPosX),
  //         -(startY + (lineWidthA * j + charPos.transPosY))
  //       );
  //     });
  //   });
  // }
  {
    // SVG要素を取得して画像に変換
    const svgElement = document.getElementById("mySvg");

    if (svgElement instanceof SVGSVGElement) {
      // SVGSVGElement型に変換されたsvgElementを使用する
      svgToImage(svgElement);
    } else {
      // svgElementがnullの場合や、HTMLElement型の場合の処理
    }

// SVG要素のパスデータを取得する
const svgElement = document.getElementById('svg');
const pathElement = svgElement.querySelector('path');
const pathData = pathElement.getAttribute('d');

console.log(pathData);

    // context.font = "400 60px RocknRoll_One";

    //   // お試し
    //   console.log(x, y);

    //   drawSVGWithFont();

    //   // SVG要素を作成
    //   const svgElement = document.createElementNS(
    //     "http://www.w3.org/2000/svg",
    //     "svg"
    //   );
    //   svgElement.setAttribute("width", "1500");
    //   svgElement.setAttribute("height", "2000");

    //   // フォントや文字サイズの設定
    //   const fontFamily = "RocknRoll_One";
    //   const fontWeight = '400'; // フォントの太さ
    //   const fontSize = 64;
    //   const fontStyle = 'italic'; // フォントのスタイル

    //   // 文字を描画する<text>要素を作成
    //   const textElement = document.createElementNS(
    //     "http://www.w3.org/2000/svg",
    //     "text"
    //   );
    //   textElement.setAttribute("x", "50");
    //   textElement.setAttribute("y", "50");
    //   textElement.setAttribute("fill", "black");
    //   textElement.setAttribute("font-family", fontFamily);
    //   textElement.setAttribute("font-size", fontSize.toString());
    //   textElement.setAttribute('font-weight', fontWeight);
    //   // textElement.setAttribute('font-style', fontStyle);
    //   textElement.textContent = "あの〜イーハトーヴォの空がどうあ";

    //   // テキストを縦書きに設定
    //   // textElement.setAttribute("writing-mode", "tb");

    //   // テキストの幅を取得
    //   const textWidth = context.measureText(text).width;
    //   var textx = (1500 - textWidth) / 2;
    //   var texty = 200 / 2;

    //   // テキストを中央に配置
    //   textElement.setAttribute("x", "100");
    //   textElement.setAttribute("y", "100");

    //   // SVGにテキストを追加
    //   svgElement.appendChild(textElement);

    //   // CanvasにSVGを描画
    //   const svgString = new XMLSerializer().serializeToString(svgElement);
    //   const DOMURL = window.URL || window.webkitURL || window;
    //   const img = new Image();
    //   const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    //   const url = DOMURL.createObjectURL(svgBlob);

    //   img.onload = function () {
    //     console.log("onload");
    //     context.drawImage(img, 50, 50);
    //     DOMURL.revokeObjectURL(url);
    //   };
    //   img.src = url;
    // }
  }
};

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

function svgToImage(svgElement: SVGSVGElement) {
  // SVGをCanvasに描画
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);
  console.log("test1");
  if (!ctx) return;
  console.log("test2");

  img.onload = function () {
    // CanvasにSVGを描画
    canvas.width = svgElement.width.baseVal.value;
    canvas.height = svgElement.height.baseVal.value;
    ctx.drawImage(img, 0, 0);

    // Canvasを画像として取得
    const imageDataURL = canvas.toDataURL("image/png");

    // 画像を表示
    const imageContainer = document.getElementById("imageContainer");
    if (!imageContainer) return;
    const imageElement = document.createElement("img");
    imageElement.src = imageDataURL;
    imageContainer.appendChild(imageElement);
    console.log(imageElement);
  };

  img.src = url;
}

function changeCanvasSize() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    return;
  }

  const canvasSize = getCanvasSize();
  canvas.setAttribute("width", canvasSize.width.toString());
  canvas.setAttribute("height", canvasSize.height.toString());
}

function getCanvasSize() {
  const yokonaga1 = document.querySelector<HTMLInputElement>(".yokonaga1");
  const masikaku = document.querySelector<HTMLInputElement>(".masikaku");
  const matiuke = document.querySelector<HTMLInputElement>(".matiuke");

  if (masikaku?.checked) {
    return { width: 2000, height: 2000 };
  } else if (matiuke?.checked) {
    return { width: 2000, height: 4000 };
  } else {
    // デフォルト値を返す
    return { width: 1500, height: 2000 };
  }
}

function check2Color(radioButtons: NodeListOf<HTMLInputElement>): string {
  const colors: { [key: string]: string } = {
    siro: "#ffffff",
    koniro: "#223a70",
    aiiro: "#165e83",
    enjiiro: "#b94047",
    fujiiro: "#bbbcde",
    azukiiro: "#96514d",
    sakurairo: "#fef4f4",
    momoiro: "#f09199",
    nezumiiro: "#949495",
    syuiro: "#ba2636",
    kuro: "#000000",
    picker: "picker",
  };
  for (let i = 0; i < radioButtons.length; i++) {
    const radioButton = radioButtons[i] as HTMLInputElement;
    if (radioButton.checked) {
      const propertyName = Object.keys(colors)[i]; // プロパティ名を取得
      return colors[propertyName];
    }
  }
  return "";
}

function getSelectedCanvasColor(): string {
  const radioButtons = document.getElementsByName(
    "c_color",
  ) as NodeListOf<HTMLInputElement>;
  const color = check2Color(radioButtons);
  if (color === "picker") {
    let title = (<HTMLInputElement>(
      document.getElementsByClassName("c_picker")[0]
    )) as HTMLInputElement;
    return title.value;
  }
  return color;
}

function getSelectedMainStrColor(): string {
  const radioButtons = document.getElementsByName(
    "ms_color",
  ) as NodeListOf<HTMLInputElement>;
  const color = check2Color(radioButtons);
  if (color === "picker") {
    let title = (<HTMLInputElement>(
      document.getElementsByClassName("ms_picker")[0]
    )) as HTMLInputElement;
    return title.value;
  }
  return color;
}

function getSelectedSubStrColor(): string {
  const radioButtons = document.getElementsByName(
    "ss_color",
  ) as NodeListOf<HTMLInputElement>;
  const color = check2Color(radioButtons);
  if (color === "picker") {
    let title = (<HTMLInputElement>(
      document.getElementsByClassName("ss_picker")[0]
    )) as HTMLInputElement;
    return title.value;
  }
  return color;
}

function insertText(): void {
  const inputTextElements: HTMLCollectionOf<HTMLInputElement> =
    document.getElementsByClassName(
      "js_input-text",
    ) as HTMLCollectionOf<HTMLInputElement>;
  const inputText: HTMLInputElement = inputTextElements[1];

  let text: string = inputText.value;
  text += "\n詞書：";

  inputText.value = text;
}

function registerButtonEvent(selector: string, callback: () => void) {
  const button = document.querySelector(selector) as HTMLElement;
  button.addEventListener("click", callback);
}

document.addEventListener("DOMContentLoaded", () => {
  registerButtonEvent(".js_downloadButton", downloadCardImage);
  registerButtonEvent(".js_insertButton", insertText);
  // registerButtonEvent('.js_tweetButton', tweet);

  const textareas = document.querySelectorAll(".js_input-text");
  textareas.forEach((areas) => {
    areas.addEventListener("input", function () {
      genereteCardImage();
    });
  });

  const radioFontInputs = document.querySelectorAll(
    'input[type="radio"][name="font"]',
  );
  radioFontInputs.forEach((fontInput) => {
    fontInput.addEventListener("change", function () {
      genereteCardImage();
    });
  });

  const radioSizeInputs = document.querySelectorAll(
    'input[type="radio"][name="size"]',
  );
  radioSizeInputs.forEach((sizeInput) => {
    sizeInput.addEventListener("change", function () {
      genereteCardImage();
    });
  });

  const radioCColorInputs = document.querySelectorAll(
    'input[type="radio"][name="c_color"]',
  );
  radioCColorInputs.forEach((ccolorInput) => {
    ccolorInput.addEventListener("change", function () {
      genereteCardImage();
    });
  });

  const radioMsColorInputs = document.querySelectorAll(
    'input[type="radio"][name="ms_color"]',
  );
  radioMsColorInputs.forEach((mscolorInput) => {
    mscolorInput.addEventListener("change", function () {
      genereteCardImage();
    });
  });

  const radioSsColorInputs = document.querySelectorAll(
    'input[type="radio"][name="ss_color"]',
  );
  radioSsColorInputs.forEach((sscolorInput) => {
    sscolorInput.addEventListener("change", function () {
      genereteCardImage();
    });
  });

  const colorPicker1 = document.querySelector(".c_picker") as HTMLInputElement;
  if (colorPicker1) {
    colorPicker1.addEventListener("change", function (event) {
      const selectedRadio = document.querySelector(
        `input[type="radio"][class="picker"][name="c_color"]`,
      ) as HTMLInputElement;
      if (selectedRadio) {
        selectedRadio.checked = true;
      }
      genereteCardImage();
    });
  }

  const colorPicker2 = document.querySelector(".ms_picker") as HTMLInputElement;
  if (colorPicker2) {
    colorPicker2.addEventListener("change", function (event) {
      const selectedRadio = document.querySelector(
        `input[type="radio"][class="picker"][name="ms_color"]`,
      ) as HTMLInputElement;
      if (selectedRadio) {
        selectedRadio.checked = true;
      }
      genereteCardImage();
    });
  }

  const colorPicker3 = document.querySelector(".ss_picker") as HTMLInputElement;
  if (colorPicker3) {
    colorPicker3.addEventListener("change", function (event) {
      const selectedRadio = document.querySelector(
        `input[type="radio"][class="picker"][name="ss_color"]`,
      ) as HTMLInputElement;
      if (selectedRadio) {
        selectedRadio.checked = true;
      }
      genereteCardImage();
    });
  }

  const downloadButton = document.getElementById("downloadButton");
  // ボタンにクリックイベントリスナーを追加
  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
      // SVG要素を取得
      const svgElement = document.getElementById("mySvg");
      if (!svgElement) {
        console.error("SVG element not found");
        return;
      }

      // SVGを文字列に変換
      const svgString = new XMLSerializer().serializeToString(svgElement);

      // Blobを作成
      const blob = new Blob([svgString], { type: "image/svg+xml" });

      // ダウンロード用のURLを作成
      const url = URL.createObjectURL(blob);

      // ダウンロードリンクを作成し、クリックする
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "my_svg_file.svg";
      downloadLink.click();

      // 不要なURLオブジェクトを解放
      URL.revokeObjectURL(url);
    });
  }
});
