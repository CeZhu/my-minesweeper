const app = new Vue({
  el: "#app",
  data: {
    game: {
      row: 10,
      col: 10,
      mineList: [],
      mineAmount: 10,
      second: 0,
      timer: 0,
      state: "ready", // ready play end
    },
    direction: [
      [-1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
    ],
    fontColor: [
      "transparent",
      "blue",
      "green",
      "yellowgreen",
      "orange",
      "red",
      "purple",
      "pink",
      "teal",
    ],
  },
  computed: {
    remainNum() {
      const flaged = this.game.mineList
        .flat()
        .filter((block) => block.flag).length;
      return this.game.mineAmount - flaged;
    },
    duration() {
      const time = this.game.second / 10;
      return time.toFixed(1);
    },
  },
  methods: {
    init() {
      this.initState();
      this.initMineList();
      this.randomMines(this.game.mineAmount);
      this.calcuNum();
    },
    initState() {
      this.game.state = "ready";
      this.game.second = 0;
      clearInterval(this.game.timer);
    },
    initMineList() {
      const row = this.game.row;
      const col = this.game.col;
      for (let i = 0; i < row; i++) {
        const b = [];
        for (let j = 0; j < col; j++) {
          b[j] = {
            mine: false,
            flag: false,
            num: 0,
            show: false,
          };
        }
        //this.game.mineList[i] = b; 数组直接赋值无法动态响应
        Vue.set(this.game.mineList, i, b);
      }
    },
    randomMines(amount) {
      let num = 0;
      const array = [];
      while (num < this.game.mineAmount) {
        let x = this.randomNum(this.game.row);
        let y = this.randomNum(this.game.col);
        const idx = x + "," + y;
        if (!array.includes(idx)) {
          array.push(idx);
          num++;
        }
      }
      for (let i = 0; i < array.length; i++) {
        const idx = array[i];
        const idx_arr = idx.split(",");
        const x = parseInt(idx_arr[0]);
        const y = parseInt(idx_arr[1]);
        this.game.mineList[x][y].mine = true;
      }
    },
    randomNum(max) {
      return Math.floor(Math.random() * max);
    },
    calcuNum() {
      const rowLen = this.game.mineList.length;
      const colLen = this.game.mineList[0].length;
      for (let i = 0; i < rowLen; i++) {
        for (let j = 0; j < colLen; j++) {
          const block = this.game.mineList[i][j];
          block.num = this.countByDirection(i, j);
          Vue.set(this.game.mineList[i], j, block);
        }
      }
    },
    countByDirection(x, y) {
      let count = 0;
      for (let i = 0; i < this.direction.length; i++) {
        const dx = this.direction[i][0];
        const dy = this.direction[i][1];
        if (
          x + dx >= 0 &&
          x + dx < this.game.mineList.length &&
          y + dy >= 0 &&
          y + dy < this.game.mineList[0].length &&
          this.game.mineList[x + dx][y + dy].mine
        ) {
          count++;
        }
      }
      return count;
    },
    sweep(x, y) {
      if (!this.gameStateCheck()) return;
      const block = this.game.mineList[x][y];
      if (block.flag) return;
      block.show = true;
      Vue.set(this.game.mineList[x], y, block);
      if (block.mine) {
        this.revealAllMines();
        clearInterval(this.game.timer);
        this.game.state = "end";
        setTimeout(() => {
          alert("you lose!");
        }, 10);
        return;
      }
      if (block.num === 0) {
        for (let i = 0; i < this.direction.length; i++) {
          const dx = this.direction[i][0];
          const dy = this.direction[i][1];
          if (
            x + dx >= 0 &&
            x + dx < this.game.mineList.length &&
            y + dy >= 0 &&
            y + dy < this.game.mineList[0].length &&
            !this.game.mineList[x + dx][y + dy].mine &&
            !this.game.mineList[x + dx][y + dy].show
          ) {
            this.sweep(x + dx, y + dy);
          }
        }
      }
      this.checkWinState();
    },
    checkWinState() {
      const blocks = this.game.mineList.flat();
      const win = !blocks.some((block) => !block.mine && !block.show);
      // console.log(win);
      if (win) {
        alert("you win!");
        clearInterval(this.game.timer);
        this.game.state = "end";
      }
    },
    revealAllMines() {
      for (let i = 0; i < this.game.mineList.length; i++) {
        for (let j = 0; j < this.game.mineList[0].length; j++) {
          const block = this.game.mineList[i][j];
          if (block.mine) {
            block.show = true;
            Vue.set(this.game.mineList[i], j, block);
          }
        }
      }
    },
    toggleFlag(x, y) {
      const block = this.game.mineList[x][y];
      if (block.show) return;
      block.flag = !block.flag;
      Vue.set(this.game.mineList[x], y, block);
    },
    setLevel(level) {
      switch (level) {
        case "easy":
          this.game.row = 10;
          this.game.col = 10;
          this.game.mineAmount = 10;
          break;
        case "medium":
          this.game.row = 16;
          this.game.col = 16;
          this.game.mineAmount = 40;
          break;
        case "hard":
          this.game.row = 16;
          this.game.col = 30;
          this.game.mineAmount = 99;
          break;
        default:
          break;
      }
      this.init();
    },
    gameStateCheck() {
      if (this.game.state === "end") return false;
      if (this.game.state === "play") return true;
      this.game.state = "play";
      this.setTimer();
      return true;
    },
    setTimer() {
      this.game.second = 0;
      clearInterval(this.game.timer);
      this.game.timer = setInterval(() => {
        this.game.second++;
      }, 100);
    },
  },
  mounted() {
    this.init();
  },
});
