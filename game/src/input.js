// Keyboard + mouse input. Keys drive the turkey; clicks drive the menus
// and a click on the canvas jumps, so the game plays with either hand.
export class Input {
  constructor(canvas) {
    this.left = false;
    this.right = false;
    this.down = false;
    this.jumpPressed = false;
    this.dashPressed = false;
    this.anyPressed = false;
    this.canvasClicked = false;
    this.canvas = canvas;
    this.handlers = [];
    this.attach();
  }

  onKey(code, down) {
    if (code === 'ArrowLeft' || code === 'KeyA') this.left = down;
    if (code === 'ArrowRight' || code === 'KeyD') this.right = down;
    if (code === 'ArrowDown' || code === 'KeyS') this.down = down;
    if (down && (code === 'Space' || code === 'ArrowUp' || code === 'KeyW')) this.jumpPressed = true;
    if (down && (code === 'ShiftLeft' || code === 'ShiftRight')) this.dashPressed = true;
    if (down) this.anyPressed = true;
  }

  attach() {
    const kd = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      this.onKey(e.code, true);
      for (const fn of this.handlers) fn(e.code, true);
    };
    const ku = (e) => this.onKey(e.code, false);
    const click = () => { this.canvasClicked = true; this.anyPressed = true; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    this.canvas.addEventListener('pointerdown', click);
    this.handlers = [];
    this._detach = () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      this.canvas.removeEventListener('pointerdown', click);
    };
  }

  // Menu keys (Enter / R / M / P) are watched by main.js through this hook.
  watch(fn) { this.handlers.push(fn); }

  consumeJump() {
    const j = this.jumpPressed || this.canvasClicked;
    this.jumpPressed = false;
    this.canvasClicked = false;
    return j;
  }

  consumeDash() {
    const d = this.dashPressed;
    this.dashPressed = false;
    return d;
  }

  consumeAny() {
    const a = this.anyPressed;
    this.anyPressed = false;
    return a;
  }
}
