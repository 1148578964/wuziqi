import {
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  UITransform,
  v3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Main")
export class Main extends Component {
  @property({ type: Prefab })
  whiteChess: Prefab;
  @property({ type: Prefab })
  blackChess: Prefab;
  @property({ type: Node })
  winPannel: Node;
  @property({ type: Node })
  losePannel: Node;
  @property({ type: Node })
  maskNode: Node;

  isGameOverTag = false;
  chesses = []; //已经下过的点
  wins = []; //赢法数组
  count = 0; //赢法总数
  chressBord = []; //棋盘上所有的点
  me = true; //是否轮到玩家执子
  myWin = []; //玩家的赢法
  computerWin = []; //电脑的赢法

  start() {
    this.gameInit();
    this.listenTouch();
  }
  gameInit() {
    this.isGameOverTag = false;
    this.chesses = [];
    this.wins = [];
    this.chressBord = [];
    this.count = 0;
    this.me = true;
    this.maskNode.active = false;
    this.winPannel.active = false;
    this.losePannel.active = false;
    this.destoryAllChesses();
    this.initGameData();
  }

  destoryAllChesses() {
    for (let item of this.node.children) {
      if (item) {
        item.destroy();
      }
    }
  }

  initGameData() {
    for (var i = 0; i < 15; i++) {
      this.chressBord[i] = [];
      for (var j = 0; j < 15; j++) {
        this.chressBord[i][j] = 0;
      }
    }
    for (var i = 0; i < 15; i++) {
      this.chressBord[i] = [];
      for (var j = 0; j < 15; j++) {
        this.chressBord[i][j] = 0;
      }
    }
    for (var i = 0; i < 15; i++) {
      this.wins[i] = [];
      for (var j = 0; j < 15; j++) {
        this.wins[i][j] = [];
      }
    }
    //横线赢法
    for (var i = 0; i < 15; i++) {
      for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
          this.wins[i][j + k][this.count] = true;
        }
        this.count++;
      }
    }
    //竖线赢法
    for (var i = 0; i < 15; i++) {
      for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
          this.wins[j + k][i][this.count] = true;
        }
        this.count++;
      }
    }
    //正斜线赢法
    for (var i = 0; i < 11; i++) {
      for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
          this.wins[i + k][j + k][this.count] = true;
        }
        this.count++;
      }
    }
    //反斜线赢法
    for (var i = 0; i < 11; i++) {
      for (var j = 14; j > 3; j--) {
        for (var k = 0; k < 5; k++) {
          this.wins[i + k][j - k][this.count] = true;
        }
        this.count++;
      }
    }
    this.computerWin = [];
    this.myWin = [];
    for (var i = 0; i < this.count; i++) {
      this.myWin[i] = 0;
      this.computerWin[i] = 0;
    }
  }

  listenTouch() {
    this.node.on(Node.EventType.TOUCH_START, this.tapChessBoard, this);
  }
  tapChessBoard(e) {
    if (this.isGameOverTag || !this.me) {
      return;
    }
    var touchPoint = this.node
      .getComponent(UITransform)
      .convertToNodeSpaceAR(v3(e.getUILocation().x, e.getUILocation().y));
    var pointX = 0;
    var pointY = 0;
    if (touchPoint.x % 50 >= 25) {
      pointX = Math.ceil(touchPoint.x / 50);
    } else {
      pointX = Math.floor(touchPoint.x / 50);
    }
    if (touchPoint.y % 50 >= -25) {
      pointY = Math.ceil(touchPoint.y / 50);
    } else {
      pointY = Math.floor(touchPoint.y / 50);
    }
    //先判断这个位置是不是已经有其它的棋子了
    if (this.ifHasChess(pointX * 50, pointY * 50)) {
      return;
    }
    var i = Math.abs(pointX);
    var j = Math.abs(pointY);
    this.createChess(pointX * 50, pointY * 50);
    if (this.chressBord[i][j] == 0) {
      this.chressBord[i][j] = 1; //我
      for (var k = 0; k < this.count; k++) {
        if (this.wins[i][j][k]) {
          this.myWin[k]++;
          this.computerWin[k] = 6; //这个位置对方不可能赢了
          if (this.myWin[k] == 5) {
            this.GameOver("player");
          }
        }
      }
    }
    //交给电脑
    this.me = false;
    this.scheduleOnce(() => {
      this.computerAI();
    }, Math.random() * 1.5);
  }
  ifHasChess(x, y) {
    for (var i = 0; i < this.chesses.length; i++) {
      if (this.chesses[i][0] == x && this.chesses[i][1] == y) {
        return true;
      }
    }
  }
  createChess(x, y) {
    var thisChess = instantiate(this.me ? this.whiteChess : this.blackChess);
    thisChess.setParent(this.node);
    thisChess.setPosition(x, y);
    if (this.me) {
      this.chesses.push([x, y, 0]);
    } else {
      this.chesses.push([x, y, 1]);
    }
  }
  GameOver(winner) {
    this.isGameOverTag = true;
    if (winner == "computer") {
      this.showLosePannel();
      console.log("电脑赢了");
    } else {
      this.showWinPannel();
      console.log("玩家赢了");
    }
  }
  showWinPannel() {
    this.maskNode.active = true;
    this.winPannel.active = true;
  }
  showLosePannel() {
    this.maskNode.active = true;
    this.losePannel.active = true;
  }
  restartGame() {
    this.gameInit();
  }
  computerAI() {
    if (this.isGameOverTag || this.me) {
      return;
    }
    var myScore = [];
    var computerScore = [];
    var max = 0;
    var u = 0,
      v = 0;
    for (var i = 0; i < 15; i++) {
      myScore[i] = [];
      computerScore[i] = [];
      for (var j = 0; j < 15; j++) {
        myScore[i][j] = 0;
        computerScore[i][j] = 0;
      }
    }
    for (var i = 0; i < 15; i++) {
      for (var j = 0; j < 15; j++) {
        if (this.chressBord[i][j] == 0) {
          for (var k = 0; k < this.count; k++) {
            if (this.wins[i][j][k]) {
              if (this.myWin[k] == 1) {
                myScore[i][j] += 200;
              } else if (this.myWin[k] == 2) {
                myScore[i][j] += 400;
              } else if (this.myWin[k] == 3) {
                myScore[i][j] += 1300;
              } else if (this.myWin[k] == 4) {
                myScore[i][j] += 5000;
              }
              if (this.computerWin[k] == 1) {
                computerScore[i][j] += 220;
              } else if (this.computerWin[k] == 2) {
                computerScore[i][j] += 600;
              } else if (this.computerWin[k] == 3) {
                computerScore[i][j] += 1200;
              } else if (this.computerWin[k] == 4) {
                computerScore[i][j] += 10000;
              }
            }
          }
          if (myScore[i][j] > max) {
            max = myScore[i][j];
            u = i;
            v = j;
          } else if (myScore[i][j] == max) {
            if (computerScore[i][j] > computerScore[u][v]) {
              u = i;
              v = j;
            }
          }
          if (computerScore[i][j] > max) {
            max = computerScore[i][j];
            u = i;
            v = j;
          } else if (computerScore[i][j] == max) {
            if (myScore[i][j] > myScore[u][v]) {
              u = i;
              v = j;
            }
          }
        }
      }
    }
    let m = u * 50;
    let n = -v * 50;
    this.createChess(m, n);
    this.chressBord[u][v] = 2;
    for (var k = 0; k < this.count; k++) {
      if (this.wins[u][v][k]) {
        this.computerWin[k]++;
        this.myWin[k] = 6; //这个位置对方不可能赢了
        if (this.computerWin[k] == 5) {
          this.GameOver("computer");
        }
      }
    }
    this.me = true;
  }
}
