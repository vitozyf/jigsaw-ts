
interface IVerify {
  spliced: boolean;
  TuringTest: boolean;
}

(function (window: Window): void {
  const l: number = 42, // 滑块边长
    r: number = 9, // 滑块半径
    w: number = 310, // canvas宽度
    h: number = 155, // canvas高度
    PI: number = Math.PI;
  const L: number = l + r * 2 + 3; // 滑块实际边长

  function getRandomNumberByRange(start: number, end: number): number {
    return Math.round(Math.random() * (end - start) + start);
  }

  function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas: HTMLElement = createElement("canvas");
    (<HTMLCanvasElement>canvas).width = width;
    (<HTMLCanvasElement>canvas).height = height;
    return (<HTMLCanvasElement>canvas);
  }

  function createImg(onload: any): HTMLImageElement {
    const img: HTMLElement = createElement("img");
    (<HTMLImageElement>img).crossOrigin = "Anonymous";
    img.onload = onload;
    img.onerror = () => {
      (<HTMLImageElement>img).src = getRandomImg();
    };
    (<HTMLImageElement>img).src = getRandomImg();
    return (<HTMLImageElement>img);
  }

  function createElement(tagName: string): HTMLElement | HTMLCanvasElement | HTMLImageElement {
    return document.createElement(tagName);
  }

  function addClass(tag: HTMLElement, className: string): void {
    tag.classList.add(className);
  }

  function removeClass(tag: HTMLElement, className: string): void {
    tag.classList.remove(className);
  }

  function getRandomImg(): string {
    return "https://picsum.photos/300/150/?image=" + getRandomNumberByRange(0, 1084);
    // return "https://vitock.cn:6061/identifying-code" + getRandomNumberByRange(0, 1) + ".jpg";
  }

  function draw(ctx: any, x: number, y: number, operation: any): void {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI);
    ctx.lineTo(x + l, y);
    ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI);
    ctx.lineTo(x + l, y + l);
    ctx.lineTo(x, y + l);
    ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true);
    ctx.lineTo(x, y);
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.stroke();
    ctx[operation]();
    ctx.globalCompositeOperation = "overlay";
  }

  function sum(x: number, y: number): number {
    return x + y;
  }

  function square(x: number): number {
    return x * x;
  }

  class Jigsaw {
    public canvasCtx: any;
    public blockCtx: any;
    public el: HTMLElement;
    public block: HTMLCanvasElement = createCanvas(300, 150);
    public img: HTMLImageElement = createImg(() => {return false;});
    public refreshIcon: HTMLElement = createElement("i");
    public slider: HTMLElement= createElement("i");
    public sliderContainer: HTMLElement= createElement("i");
    public sliderMask: HTMLElement= createElement("i");
    public text: HTMLElement= createElement("i");
    public x: number = 0;
    public y: number = 0;
    public trail: number[] = [];

    onSuccess: () => {};
    onFail: () => {};
    onRefresh: () => {};
    constructor({ el, onSuccess, onFail, onRefresh }: any) {
      this.el = el;
      this.onSuccess = onSuccess;
      this.onFail = onFail;
      this.onRefresh = onRefresh;
    }

    init(): void {
      this.initDOM();
      this.initImg();
      this.bindEvents();
    }

    initDOM(): void {
      const canvas: HTMLCanvasElement = createCanvas(w, h); // 画布
      const block: HTMLCanvasElement = (<HTMLCanvasElement>canvas.cloneNode(true)); // 滑块
      const sliderContainer: HTMLElement = createElement("div");
      const refreshIcon: HTMLElement = createElement("div");
      const sliderMask: HTMLElement = createElement("div");
      const slider: HTMLElement = createElement("div");
      const sliderIcon: HTMLElement = createElement("span");
      const text: HTMLElement = createElement("span");

      block.className = "block";
      sliderContainer.className = "sliderContainer";
      refreshIcon.className = "refreshIcon";
      sliderMask.className = "sliderMask";
      slider.className = "slider";
      sliderIcon.className = "sliderIcon";
      text.innerHTML = "向右滑动滑块填充拼图";
      text.className = "sliderText";

      const el: HTMLElement = this.el;
      el.appendChild(canvas);
      el.appendChild(refreshIcon);
      el.appendChild(block);
      slider.appendChild(sliderIcon);
      sliderMask.appendChild(slider);
      sliderContainer.appendChild(sliderMask);
      sliderContainer.appendChild(text);
      el.appendChild(sliderContainer);

      Object.assign(this, {
        canvas,
        block,
        sliderContainer,
        refreshIcon,
        slider,
        sliderMask,
        sliderIcon,
        text,
        canvasCtx: canvas.getContext("2d"),
        blockCtx: block.getContext("2d")
      });
    }

    initImg(): void {
      const img: HTMLImageElement = createImg(() => {
        this.draw();
        this.canvasCtx.drawImage(img, 0, 0, w, h);
        this.blockCtx.drawImage(img, 0, 0, w, h);
        const y: number = this.y - r * 2 - 1;
        const ImageData: any = this.blockCtx.getImageData(this.x - 3, y, L, L);
        this.block.width = L;
        this.blockCtx.putImageData(ImageData, 0, y);
      });
      this.img = img;
    }

    draw(): void {
      // 随机创建滑块的位置
      this.x = getRandomNumberByRange(L + 10, w - (L + 10));
      this.y = getRandomNumberByRange(10 + r * 2, h - (L + 10));
      draw(this.canvasCtx, this.x, this.y, "fill");
      draw(this.blockCtx, this.x, this.y, "clip");
    }

    clean(): void {
      this.canvasCtx.clearRect(0, 0, w, h);
      this.blockCtx.clearRect(0, 0, w, h);
      this.block.width = w;
    }

    bindEvents(): void {
      this.el.onselectstart = () => false;
      this.refreshIcon.onclick = () => {
        this.reset();
        if (typeof this.onRefresh === "function") {
          this.onRefresh();
        }
      };

      let originX: number, originY: number, trail: number[] = [], isMouseDown: boolean = false;
      this.slider.addEventListener("mousedown", (e: MouseEvent) => {
        originX = e.x, originY = e.y;
        isMouseDown = true;
      });
      document.addEventListener("mousemove", (e) => {
        if (!isMouseDown) { return false; }
        const moveX: number = e.x - originX;
        const moveY: number = e.y - originY;
        if (moveX < 0 || moveX + 38 >= w) { return false; }
        this.slider.style.left = moveX + "px";
        var blockLeft: number = (w - 40 - 20) / (w - 40) * moveX;
        this.block.style.left = blockLeft + "px";

        addClass(this.sliderContainer, "sliderContainer_active");
        this.sliderMask.style.width = moveX + "px";
        trail.push(moveY);
      });
      document.addEventListener("mouseup", (e) => {
        if (!isMouseDown) { return false; }
        isMouseDown = false;
        if (e.x === originX) { return false; }
        removeClass(this.sliderContainer, "sliderContainer_active");
        this.trail = trail;
        const { spliced, TuringTest } = this.verify();
        if (spliced) {
          if (TuringTest) {
            addClass(this.sliderContainer, "sliderContainer_success");
            if (typeof this.onSuccess === "function") {
              this.onSuccess();
            }
          } else {
            addClass(this.sliderContainer, "sliderContainer_fail");
            this.text.innerHTML = "再试一次";
            this.reset();
          }
        } else {
          addClass(this.sliderContainer, "sliderContainer_fail");
          if (typeof this.onFail === "function") {
            this.onFail();
          }
          setTimeout(() => {
            this.reset();
          }, 600);
        }
      });
    }

    verify(): IVerify {
      const arr: number[] = this.trail; // 拖动时y轴的移动距离
      const average: number = arr.reduce(sum) / arr.length; // 平均值
      const deviations: number[] = arr.map(x => x - average); // 偏差数组
      const stddev: number = Math.sqrt(deviations.map(square).reduce(sum) / arr.length); // 标准差
      const styleLeft: string | null = this.block.style.left;
      const left: number = parseInt(<string>styleLeft, 10);
      return {
        spliced: Math.abs(left - this.x) < 10,
        TuringTest: average !== stddev, // 只是简单的验证拖动轨迹，相等时一般为0，表示可能非人为操作
      };
    }

    reset(): void {
      this.sliderContainer.className = "sliderContainer";
      this.slider.style.left = "0";
      this.block.style.left = "0";
      this.sliderMask.style.width = "0";
      this.clean();
      this.img.src = getRandomImg();
    }

  }

  window.jigsaw = {
    init: (opts: any) => {
      let Instance: Jigsaw = new Jigsaw(opts);
      Instance.init();
      return Instance;
    }
  };
}(window));