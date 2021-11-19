'use strict';

var count = 0;  //デバック用カウント

//色相、彩度、輝度
var h = 0;
var s = 100;
var l = 50;

let angle = 0;  //書き始める角度を設定

let pointColor; //クリックした際の色の番号を格納

var firstFlag = true;  //初回の描写のflag

const alpha = 1;    //透明度の指定

const ColorType = 24;   //色の数

const ColorAngle = 360 / ColorType;  //一色の角度

const colors = new Array(ColorType);    //色を格納する配列

//配列に色を格納数する
for(var i = 0; i < colors.length; i++){
    colors[i] = "hsl(" + h + "," + s + "%," + l + "%)";
    h += ColorAngle;
}

var container;

var canvas;

var ctx;

var x;    //円の中心のx座標

var y;    //円の中心のy座標

var radius;   //円の半径

makeHueCircle();

//色相環を作成するためのメソッド
async function makeHueCircle(){
    container = document.getElementById('hue-circle-container');
    canvas = document.getElementById('hue-circle');

    ctx = canvas.getContext('2d');

    //hue-circle-containerの大きさをcanvasの大きさにする。（cssにより大きさを設定）
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    x = canvas.width/2;   
    y = canvas.height/2;
    radius = x < y ? x : y;


    for(var i = 0; i < colors.length; i++){
        if(firstFlag){
            await sleep(100);
        }
        fillCircle(ctx, x, y, radius, angle, angle+ColorAngle, colors[i]);
        angle += ColorAngle; 
    }    

    firstFlag = false;

    //中心の塗りつぶしの白い円を描く
    fillCircle(ctx, x, y, radius/2, 0, 360, '#FFFFFF');
}

//角度をラジアンに変える関数
function toRadian(angle){
    return angle * Math.PI / 180;
};

//引数秒後まで処理を待つ同期処理
function sleep(milliseconds){
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/*
色のついた色相環を作るメソッド

startAngle : 円の開始角度
endAngle : 円の終了角度
colorCode : 塗りつぶしの色を指定
*/
function fillCircle(ctx, x, y, radius, startAngle, endAngle, colorCode)
{
    //描写のためのパスを作成
    ctx.beginPath();

    //パスの開始座標の指定
    ctx.moveTo(x,y);

    //パスに円弧を加える（引数の2つの角度をラジアン角に変換する）
    ctx.arc(x, y, radius, toRadian(startAngle), toRadian(endAngle));

    //色の透明度を指定
    ctx.globalAlpha = alpha;

    //円の塗りつぶしの色を登録する
    ctx.fillStyle = colorCode;

    //円の中を指定した色で塗りつぶす
    //縁取り付け意を描写する場合はstroke
    ctx.fill();
};

//以下は動的処理

//彩度と輝度のスライドバーを作成
const Selem = document.getElementById('Saturation');
const Starget = document.getElementById('s-current-value');
const Lelem = document.getElementById ('Lightness');
const Ltarget = document.getElementById('l-current-value');

//イベント発生（スライダーが動く）の時に出力の値を変化させる
function rangeOnChange(elem, target){
    return function(){
        target.innerText = elem.value;
    }
}

//ページを読み込む際に初期値を出力する
window.onload = () => {
    Selem.addEventListener('input', rangeOnChange(Selem, Starget));
    Lelem.addEventListener('input', rangeOnChange(Lelem, Ltarget));
    Starget.innerText = Selem.value;
    Ltarget.innerText = Lelem.value;
}

//中心の円をクリックした色に塗りつぶす
function fillWhiteCircle(colorsNumber){
    fillCircle(ctx, x, y, (radius * 9)/20, 0, 360, colors[colorsNumber]);
}

//現在取得している色相、彩度、輝度の値を配列に格納する
//その後設定した配列で色相環を作り、中心の色も設定する。
function setColors(){
    h = 0;
    for(var i = 0; i < colors.length; i++){
        colors[i] = "hsl(" + h + "," + Selem.value + "%," + Lelem.value + "%)";
        h += ColorAngle;
    }
    makeHueCircle();
    fillWhiteCircle(pointColor);
}

//彩度、輝度のバーが変化したときに色相環の色も変化させる
Selem.addEventListener('input', setColors, false);
Lelem.addEventListener('input', setColors, false);

addEventListener('click', e =>{
    //canvas外のmarginの高さを取得する（bodyのmargin）
    const elmBody = document.querySelector('body');
    const styleBody = window.getComputedStyle(elmBody);
    const rectTop = parseFloat(styleBody.getPropertyValue('margin-top'));

    //canvas外のmarginの左の幅を取得する（canvasのmargin）
    const elmCanvas = document.querySelector('#hue-circle-container');
    const styleCanvas = window.getComputedStyle(elmCanvas);
    const rectLeft = parseFloat(styleCanvas.getPropertyValue('margin-left')) + rectTop;


    const rect = e.target.getBoundingClientRect(); //canvasの左端の座標を取得

    //canvas上におけるカーソルの座標を取得
    const canvasX = e.clientX - rect.left;　
    const canvasY = e.clientY - rect.top;
    console.log(rect.left, rectLeft, rect.top, rectTop);

    
    //カーソルがcanvas内にあるときカーソルの位置と円の中心との距離を計算する
    if(Math.floor(rect.left*Math.pow(10,2))/Math.pow(10,2) === rectLeft && rect.top === rectTop){
    const distance = Math.sqrt(Math.pow(x - canvasX, 2) + Math.pow(y - canvasY, 2));
            
        //カーソルが色の範囲内にあるとき
        if(radius/2 <= distance && distance <= radius){
            const pointRadian = Math.atan2(canvasY - y, canvasX - x);   //円の中心を原点とし原点、カーソルの座標、x軸のなす角を求める

            //pointRadianの角度のよって中心の白い円を塗りつぶす色を決める
            //同時に中心の色の持つ数字（pointColor）の値を設定する。
            if(0 <= pointRadian && pointRadian < toRadian(ColorAngle * 1)){
                fillWhiteCircle(0);
                pointColor = 0;
            }
            else if(toRadian(ColorAngle * 1) <= pointRadian && pointRadian < toRadian(ColorAngle * 2)){
                fillWhiteCircle(1);
                pointColor = 1;
            }
            else if(toRadian(ColorAngle * 2) <= pointRadian && pointRadian < toRadian(ColorAngle * 3)){
                fillWhiteCircle(2);
                pointColor = 2;
            }
            else if(toRadian(ColorAngle * 3) <= pointRadian && pointRadian < toRadian(ColorAngle * 4)){
                fillWhiteCircle(3);
                pointColor = 3;
            }
            else if(toRadian(ColorAngle * 4) <= pointRadian && pointRadian < toRadian(ColorAngle * 5)){
                fillWhiteCircle(4);
                pointColor = 4;
            }
            else if(toRadian(ColorAngle * 5) <= pointRadian && pointRadian < toRadian(ColorAngle * 6)){
                fillWhiteCircle(5);
                pointColor = 5;
            }
            else if(toRadian(ColorAngle * 6) <= pointRadian && pointRadian < toRadian(ColorAngle * 7)){
                fillWhiteCircle(6);
                pointColor = 6;
            }
            else if(toRadian(ColorAngle * 7) <= pointRadian && pointRadian < toRadian(ColorAngle * 8)){
                fillWhiteCircle(7);
                pointColor = 7;
            }
            else if(toRadian(ColorAngle * 8) <= pointRadian && pointRadian < toRadian(ColorAngle * 9)){
                fillWhiteCircle(8);
                pointColor = 8;
            }
            else if(toRadian(ColorAngle * 9) <= pointRadian && pointRadian < toRadian(ColorAngle * 10)){
                fillWhiteCircle(9);
                pointColor = 9;
            }
            else if(toRadian(ColorAngle * 10) <= pointRadian && pointRadian < toRadian(ColorAngle * 11)){
                fillWhiteCircle(10);
                pointColor = 10;
            }
            else if(toRadian(ColorAngle * 11) <= pointRadian && pointRadian < toRadian(ColorAngle * 12)){
                fillWhiteCircle(11);
                pointColor = 11;
            }
            else if(toRadian(ColorAngle * -12) <= pointRadian && pointRadian < toRadian(ColorAngle * -11)){
                fillWhiteCircle(12);
                pointColor = 12;
            }
            else if(toRadian(ColorAngle * -11) <= pointRadian && pointRadian < toRadian(ColorAngle * -10)){
                fillWhiteCircle(13);
                pointColor = 13;
            }
            else if(toRadian(ColorAngle * -10) <= pointRadian && pointRadian < toRadian(ColorAngle * -9)){
                fillWhiteCircle(14);
                pointColor = 14;
            }
            else if(toRadian(ColorAngle * -9) <= pointRadian && pointRadian < toRadian(ColorAngle * -8)){
                fillWhiteCircle(15);
                pointColor = 15;
            }
            else if(toRadian(ColorAngle * -8) <= pointRadian && pointRadian < toRadian(ColorAngle * -7)){
                fillWhiteCircle(16);
                pointColor = 16;
            }
            else if(toRadian(ColorAngle * -7) <= pointRadian && pointRadian < toRadian(ColorAngle * -6)){
                fillWhiteCircle(17);
                pointColor = 17;
            }
            else if(toRadian(ColorAngle * -6) <= pointRadian && pointRadian < toRadian(ColorAngle * -5)){
                fillWhiteCircle(18);
                pointColor = 18;
            }
            else if(toRadian(ColorAngle * -5) <= pointRadian && pointRadian < toRadian(ColorAngle * -4)){
                fillWhiteCircle(19);
                pointColor = 19;
            }
            else if(toRadian(ColorAngle * -4) <= pointRadian && pointRadian < toRadian(ColorAngle * -3)){
                fillWhiteCircle(20);
                pointColor = 20;
            }
            else if(toRadian(ColorAngle * -3) <= pointRadian && pointRadian < toRadian(ColorAngle * -2)){
                fillWhiteCircle(21);
                pointColor = 21;
            }
            else if(toRadian(ColorAngle * -2) <= pointRadian && pointRadian < toRadian(ColorAngle * -1)){
                fillWhiteCircle(22);
                pointColor = 22;
            }
            else if(toRadian(ColorAngle * -1) <= pointRadian && pointRadian < 0){
                fillWhiteCircle(23);
                pointColor = 23;
            }
        }
    }
})


/*
RGB表記の12色
const colors = [
    "rgba(255, 230, 0)",  //'Y'  : '#FFE600'
    "rgba(153, 207, 21)", //'YG' : '#99CF15'
    "rgba(51, 162, 61)",  //'G'  : '#33A23D'
    "rgba(0, 134, 120)",  //'GB' : '#008678'
    "rgba(5, 93, 135)",   //'gB' : '#055D87'
    "rgba(15, 33, 136)",  //'B'  : '#0F2188'
    "rgba(40, 18, 133)",  //'V'  : '#281285'
    "rgba(86, 0, 125)",   //'P'  : '#56007D'
    "rgba(175, 0, 101)",  //'RP' : '#AF0065'
    "rgba(238, 0, 38)",   //'R'  : '#EE0026'
    "rgba(254, 65, 24)",  //'rO' : '#FE4118'
    "rgba(255, 127,0)"    //'yO' : '#FF7F00'
];    

HSL表記の12色
const colors = [
    "hsl(0, 100%, 50%)",   //R
    "hsl(30, 0%, 0%)",  //ro
    "hsl(60, 0%, 0%)",  //yo
    "hsl(90, 0%, 0%)",  //y
    "hsl(120, 0%, 0%)", //yg
    "hsl(180, 0%, 0%)", //g
    "hsl(210, 0%, 0%)", //gb
    "hsl(240, 0%, 0%)", //b
    "hsl(270, 0%, 0%)", //v
    "hsl(300, 0%, 0%)", //p
    "hsl(330, 0%, 0%)", //rp
    "hsl(360, 0%, 0%)", //r
];
*/

//引数にcolorsの値（色）を入れ色相環の描写を始める
//originai : makeHueCircle(Object.values(colors));

/* TO Do List
1.クリックされたときにキャンバス上のそこの座標を調べる。（もしかしたらキャンバスの変数宣言を大域変数に移動するかも）
2.その座標が色相環の色の色の中であったら、クリックした時のfunctionを作る
ここまで終わり

3. switch分で色の場所で白い円をその色で塗りつぶすメソッドを動かすようにする。
(色相環のバーといった色以外のところを触ったらリセット)
*/
