const NUMBER=5;
var CHANGE = false;

//Triangle[] t = new Triangle[number];
//ArrayListを用いて三角形の追加と削除をできるようにする。ここでは宣言だけ。
var t = [];

function setup() {
  createCanvas(windowWidth,windowHeight);
  frameRate(50);
  background(255, 255, 255);
  noStroke();//ここではArrayListを確保する。
}

function draw() {
  background(255);
  
  //changeがtrueの時に画面遷移を行う
  if(CHANGE)    window.location.href = "second.html";

  //Listの中身がないとき(NULL)でないときに実行
  if (t.length!=0) {

    let i=t.length-1;  //listの最後のインデックスの値を全体の個数から獲得
    
    //Listの後ろから5番目まで三角形のオブジェクトを表示し移動させる。
    while (i>=0) { 
        
      t[i].display();
      t[i].move();
      i--;
    }
  
    //Listの頭から探索をしていき画面外の三角形のオブジェクトを削除する
    for(let j=0; j<t.length; j++) {
      if (t[j].outOfCanvas()) {
        t.splice(j,1);
      }
    }
  }

  //画面に三角形が指定の数現れたらフレームレートを落としCHANGEをtrueにする
  if(t.length >= 55){
    background(255);
    frameRate(1);
    CHANGE = true;
  }
}

function mouseClicked() {
  //色と透明度をランダムに決める。
  fill(random(0, 255), random(0, 255), random(0, 255), 255-4*t.length);

  let count=0;
  //五個分の三角形のオブジェクトを作成する。
  while (count<NUMBER) {
    t.push(new Triangle(mouseX, mouseY));
    count++;
  }

  //追加したもののメソッドを呼び出す
  for(let i=t.length-1;i>=t.length-NUMBER;i--){
      t[i].setPoint();
      t[i].arrangePoint();
  }
}



//三角形クラス
class Triangle {
  //コンストラクタ
  constructor(mx, my) {
    this.mx = mx;
    this.my = my;
    this.A;
    this.B;
    this.C;
    this.p1 = [];
    this.p2 = [];
    this.p3 = [];
    this.randomMoveX=random(-5, 5);
    this.randomMoveY=random(-5, 5);
    this.flag=false;
  }

  //三点を設定する関数
  setPoint() {
    var p1_x;
    var p2_x;
    var p3_x;
    var cutAngle = 40;
    var angleA;
    var angleB;
    var angleC;

    while (true) {
        //三点をランダムに設定
        p1_x = [random(0, width), random(0, height)];
        p2_x = [random(0, width), random(0, height)];
        p3_x = [random(0, width), random(0, height)];

        //三辺の長さを点から設定
        this.A = dist(p1_x[0], p1_x[1], p2_x[0], p2_x[1]);
        this.B = dist(p2_x[0], p2_x[1], p3_x[0], p3_x[1]);
        this.C = dist(p3_x[0], p3_x[1], p1_x[0], p1_x[1]);

        //三辺からそれぞれの角度を設定
        angleA=degrees(acos((sq(this.B)+sq(this.C)-sq(this.A))/(2*this.B*this.C)));
        angleB=degrees(acos((sq(this.C)+sq(this.A)-sq(this.B))/(2*this.C*this.A)));
        angleC=degrees(acos((sq(this.A)+sq(this.B)-sq(this.C))/(2*this.A*this.B)));

        //3点の内座標が一つでも被った時にはやり直し
        if (((p1_x[0]==p2_x[0]) && (p1_x[1]==p2_x[1])) || ((p2_x[0] == p3_x[0]) && (p2_x[1] == p3_x[1])) || ((p3_x[0] == p1_x[0]) && (p3_x[1] == p1_x[1]))) {
            continue;
        }
        //とりあえずcutAngle度以下の角を持つ三角形があったらやり直し
        else if(angleA<=cutAngle || angleB<=cutAngle || angleC<=cutAngle) {
            continue;
        }
        //やり直しでないときには成功したということであるから繰り返しを抜ける
        else {
            for (let i=0; i<2; i++) {
                this.p1[i] = p1_x[i];
                this.p2[i] = p2_x[i];
                this.p3[i] = p3_x[i];
            }
            break;
      }
    }
  }

  //ランダムの大きさの三角形の大きさを位置を調整する関数
  arrangePoint() {

    var threeEdges=this.A+this.B+this.C;
    var maxEdges=300;
    var rate=1;

    //三角形の大きさにより任意倍率を設定。
    if (threeEdges>maxEdges) {
      rate=maxEdges/threeEdges;
    }

    for (let i=0; i<2; i++) {
      this.p1[i] *= rate;
      this.p2[i] *= rate;
      this.p3[i] *= rate;
    }

    //三角形をリサイズしたらここで重心の座標を取得、G[0]はｘ座標、G[1]はｙ座標
    var G = [(this.p1[0]+this.p2[0]+this.p3[0])/3, (this.p1[1]+this.p2[1]+this.p3[1])/3];

    //点の座標を手動で動かす。ここでtranslateを使うとオブジェクト作成ごとに座標系をリセットしなければいけなくなるからこうした。
    this.p1[0] += this.mx-G[0];
    this.p2[0] += this.mx-G[0];
    this.p3[0] += this.mx-G[0];
    this.p1[1] += this.my-G[1];
    this.p2[1] += this.my-G[1];
    this.p3[1] += this.my-G[1];
  }

  //三角形を表示する関数
  display() {
    triangle(this.p1[0], this.p1[1], this.p2[0], this.p2[1], this.p3[0], this.p3[1]);
  }
  //図形がランダムウォークする関数
  move() {
    this.p1[0] += this.randomMoveX;
    this.p2[0] += this.randomMoveX;
    this.p3[0] += this.randomMoveX;
    this.p1[1] += this.randomMoveY;
    this.p2[1] += this.randomMoveY;
    this.p3[1] += this.randomMoveY;
  }

  //canvasの外に三角形座標のmax,minがあるときにtrueを返す関数
  outOfCanvas() {
    var max_x = max(this.p1[0], this.p2[0], this.p3[0]);
    var min_x = min(this.p1[0], this.p2[0], this.p3[0]);
    var max_y = max(this.p1[1], this.p2[1], this.p3[1]);
    var min_y = min(this.p1[1], this.p2[1], this.p3[1]);

    if (max_x<0 || min_x>width || max_y<0 || min_y>height) {
      return !this.flag;
    } else {
      return this.flag;
    }
  }
}