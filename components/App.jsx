import CodeMirrorEditor from './CodeMirrorEditor.jsx';
import d from '@dominant/core';
import { bem, tw } from '../css.js';

document.head.append(d.el('style', `
  .App {
    background-color: #2f272b;
  }

  .App .ace-monokai {
    background-color: #2728225e;
  }

  .App .ace-monokai .ace_gutter {
    background-color: #2f31298c;
  }

  .App .ace-monokai .ace_marker-layer .ace_active-line {
    background-color: #20202036;
  }

  .App-logo {
    opacity: 0.02;
    animation: App-logo-spin infinite 20s linear;
  }

  .App-editor {
    display: flex;
    flex-direction: column;
    min-height: 70vh;
  }

  .App-editor .CodeMirror {
    flex: 1;
  }

  .App-link {
    color: #f96161;
  }

  @keyframes App-logo-spin {
    from { transform: rotate(360deg) }
    to { transform: rotate(0deg) }
  }
`));

class App {
  css = bem('App', {
    root: `
      flex
      font-mono
      text-white
    `,

    logoWrapper: `
      fixed left-0 top-0 right-0 bottom-0
      flex flex-col align-center justify-center
      pointer-events-none
    `,

    logo: ``,

    cols: `
      w-full
      grid lg:grid-cols-6 lg:gap-8
      lg:px-3 lg:py-2 lg:p-8
    `,

    editor: `
      col-span-4
    `,

    stateCol: `
      col-span-2
      flex flex-col gap-4
      p-3 lg:p-0
    `,

    btn: `
      focus:outline-none
      focus:underline
    `,

    hzInput: `
      w-12
      outline-none
      text-base
      bg-transparent
      focus:underline
    `,
  });

  ctrl = {
    dbg: 1,
    hz: 1,
  };

  pi = { reset: '1' };
  po = {};

  ydoc = new Y.Doc();
  idbp = new IndexeddbPersistence(this.glitchId, this.ydoc);
  wsp = this.glitchSpace !== 'local' && new WebsocketProvider(
    'wss://protohub.guiprav.cc/yjs', `glitch:${this.glitchSpace}`, this.ydoc);

  get user() {
    let user = new URLSearchParams(location.search).get('user');
    if (user || !this.wsp) { return user }
    return this.wsp.awareness.getLocalState().user?.name;
  }

  get color() {
    let color = new URLSearchParams(location.search).get('color');
    if (color || !this.wsp) { return `#${color}` }
    return this.wsp.awareness.getLocalState().user?.color;
  }

  get glitchName() { return new URLSearchParams(location.search).get('glitch') }
  get glitchSpace() { return new URLSearchParams(location.search).get('space') || 'local' }
  get glitchId() { var name = this.glitchName; return name && `glitch:${name}@${this.glitchSpace}` }
  stepCode = this.ydoc.getText(this.glitchId);
  undoMan = new Y.UndoManager(this.stepCode);

  onStep = () => {
    try {
      (new Function(this.stepCode)).call(this);
    } catch (err) {
      console.error(err);
      this.ctrl.dbg = 1;
    }

    d.update();
  };

  onAttach = () => {
    let { user } = this;
    if (!user || !this.wsp) { return }

    console.log(user, this.color);
    this.wsp.awareness.setLocalStateField('user', {
      name: user,
      color: this.color,
    });
  };

  render = () => (
    <div model={this} onAttach={this.onAttach} class={this.css.root} style={{ minHeight: '100vh' }}>
      <div class={this.css.logoWrapper} style={{ height: '100vh' }}>
        <img src="logo.svg" class={this.css.logo} style={{ height: '40vmin' }} />
      </div>

      <form class={this.css.cols} values={this.ctrl}>
        <CodeMirrorEditor
          class={this.css.editor}
          content={this.stepCode}
          awareness={this.wsp?.awareness}
          undoMan={this.undoMan}
        />

        <div class={this.css.stateCol}>
          <div>
            <div><b>ctrl:</b></div>

            <button
              class={this.css.btn}
              type="button"
              onClick={() => this.pi.reset = '1'}
              children="reset"
            />
            {' '}
            <button
              class={this.css.btn}
              type="button"
              onClick={() => this.ctrl.dbg = +!this.ctrl.dbg}
            >
              dbg = {d.text(() => +Boolean(this.ctrl.dbg))}
            </button>
            {' '}
            {d.if(this.ctrl.dbg, (
              <button
                class={this.css.btn}
                type="button"
                onClick={this.onStep}
                children="step"
              />
            ))}
            {' '}
            <span hidden={this.ctrl.dbg}>
              hz = <input class={this.css.hzInput} type="text" name="hz" />
            </span>
          </div>

          <div>
            <div><b>pi:</b></div>

            {d.map(Object.keys(this.pi), k => (
              <div><pre><code>
                {d.text(() => `${k} = ${this.pi[k]}`)}
                <LedArray d={this.pi[k]} />
              </code></pre></div>
            ))}
          </div>

          {d.if(Object.keys(this.po).length, (
            <div>
              <div><b>po:</b></div>

              {d.map(Object.keys(this.po), k => (
                <div><pre><code>
                  {d.text(() => `${k} = ${this.po[k]}`)}
                  <LedArray d={this.po[k]} />
                </code></pre></div>
              ))}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}

class LedArray {
  css = bem('LedArray', {
    root: `
      relative
      inline-flex align-middle gap-1
      mx-2
      rounded-full
      p-1
      bg-gray-700 bg-opacity-75
    `,
    led: `inline-block w-2 h-2 rounded-full`,
  });

  constructor(props) { this.props = props }

  render = () => (
    <span class={this.css.root} style={{ top: '-1px' }}>
      {d.map(Object.keys(String(this.props.d).split('')), i => (
        <i class={[
          this.css.led,
          tw(Number(String(this.props.d)[i]) ? 'bg-red-500' : 'bg-gray-500'),
        ]} />
      ))}
    </span>
  );
}

let stepCode = `
let self = this;
let { pi, po } = self;

// Only executes when reset pin is high (executes setup/reset logic):
if (+pi.reset) {
  definePrimitives();

  // Instantiate basic circuits from primitives:
  self.pc = self.counter(8);
  self.rx = self.reg(8);
  self.ry = self.reg(8);
  self.ra = self.adder(8);
  self.raddr = self.reg(8);
  self.mem = self.sram(8, 8); // 256 bytes total

  // Reset/initialize "input/ctrl signals"
  // (plus the bus, which is is a string of "read/write pins"):
  pi = self.pi = {
    reset: '0',        // RESET input signal
    clk: '0',          // CLK input signal
    ldwrincpc: '000',  // {LOAD,WRITE,INC}_PC register ctrl signals
    ldwrx: '00',       // {LOAD,WRITE}_X register ctrl signals
    ldwry: '00',       // {LOAD,WRITE}_Y register ctrl signals
    wra: '0',          // WRITE_A register ctrl signal
    ldaddr: '0',       // LOAD_ADDR (memory) ctrl signal
    ceweoemem: '000',  // {CHIP,WRITE,OUTPUT}_EN_MEM ctrl signals
    bus: '00000000',   // BUS signals
  };

  self.ins = null;
  self.halfCycles = 0;
  self.fullCycles = 0;

  self.program = [
    ['ldx.i', 1],      // Load X (immediate): RX = 1
    ['ldy.i', 2],      // Load y (immediate): RY = 2

    ['stx.ri', 'ry'],  // Store X (register indirect): *RY = RX
    ['sty.ri', 'rx'],  // Store Y (register indirect): *RX = RY

    ['ldx.i', 0],      // Load X (immediate): RX = 0
    ['ldy.i', 0],      // Load Y (immediate): RY = 0

    ['ldx.a', 1],      // Load X (absolute): RX = 2
    ['ldy.a', 2],      // Load Y (absolute): RY = 1

    ['hlt'],
  ];

  console.log('%cRESET', 'font-weight: bold');
}

// Begin system step code:
pi.clk = +!Number(pi.clk); self.halfCycles++; if (!pi.clk) { self.fullCycles++ }

// Update program counter, write it to the bus (if WRITE_PC signal is 1):
po.pc = self.pc({ en: pi.ldwrincpc[2], clk: pi.clk }).q;
pi.bus = self.buf({ d: po.pc, z: pi.bus, en: pi.ldwrincpc[1] });

// "Instruction decoding" & microcode execution:
let ins = self.program[self.fromBitStr(po.pc)];
let firstInsCycle = ins !== self.ins;
logState();
self.ins = ins;

// NOTE: System signals are only reconfigured on falling clk edges (they are
// executed on rising clk edges):
if (!pi.clk) {
  switch (ins[0]) {
    case 'ldx.i':
      pi.ldwrincpc = '001';
      pi.ldwrx = '10';
      pi.ldwry = '00';
      pi.wra = '0';
      pi.ldaddr = '0';
      pi.ceweoemem = '000';
      pi.bus = self.toBitStr(8, ins[1]);
      break;

    case 'ldy.i':
      pi.ldwrincpc = '001';
      pi.ldwrx = '00';
      pi.ldwry = '10';
      pi.wra = '0';
      pi.ldaddr = '0';
      pi.ceweoemem = '000';
      pi.bus = self.toBitStr(8, ins[1]);
      break;

    case 'stx.ri':
      pi.ldwrincpc = '00' + +!Number(pi.ldwrincpc[2]);

      pi.ldwrx = +pi.ldwrincpc[2] === 0 ? (ins[1] === 'rx' ? '10' : '00') : '01';
      pi.ldwry = +pi.ldwrincpc[2] === 0 ? (ins[1] === 'ry' ? '10' : '00') : '00';
      pi.wra = +pi.ldwrincpc[2] === 0 ? (ins[1] === 'ra' ? '1' : '0') : '0';
      pi.ldaddr = +!Number(pi.ldwrincpc[2]);
      pi.ceweoemem = +pi.ldwrincpc[2] === 0 ? '000' : '110';

      break;

    case 'sty.ri':
      pi.ldwrincpc = '00' + +!Number(pi.ldwrincpc[2]);

      pi.ldwrx = +pi.ldwrincpc[2] === 0 ? (ins[1] === 'rx' ? '10' : '00') : '00';
      pi.ldwry = +pi.ldwrincpc[2] === 0 ? (ins[1] === 'ry' ? '10' : '00') : '01';
      pi.wra = +pi.ldwrincpc[2] === 0 ? (ins[1] === 'ra' ? '1' : '0') : '0';
      pi.ldaddr = +!Number(pi.ldwrincpc[2]);
      pi.ceweoemem = +pi.ldwrincpc[2] === 0 ? '000' : '110';

      break;

    case 'ldx.a':
      pi.ldwrincpc = '00' + +!Number(pi.ldwrincpc[2]);

      if (+pi.ldwrincpc[2] === 0) {
        pi.ldwrx = '00';
        pi.ldwry = '00';
        pi.wra = '0';
        pi.ldaddr = '1';
        pi.bus = self.toBitStr(8, ins[1]);
      } else {
        pi.ldwrx = '10';
        pi.ldwry = '00';
        pi.wra = '0';
        pi.ldaddr = '0';
        pi.ceweoemem = '101';
      }

      break;

    case 'ldy.a':
      pi.ldwrincpc = '00' + +!Number(pi.ldwrincpc[2]);

      if (+pi.ldwrincpc[2] === 0) {
        pi.ldwrx = '00';
        pi.ldwry = '00';
        pi.wra = '0';
        pi.ldaddr = '1';
        pi.bus = self.toBitStr(8, ins[1]);
      } else {
        pi.ldwrx = '00';
        pi.ldwry = '10';
        pi.wra = '0';
        pi.ldaddr = '0';
        pi.ceweoemem = '101';
      }

      break;

    case 'hlt':
      pi.ldwrincpc = '000';
      pi.ldwrx = '00';
      pi.ldwry = '00';
      pi.wra = '0';
      pi.ldaddr = '0';
      pi.ceweoemem = '000';
      break;
  }
}

// LOAD register X from bus (only if LOAD_X is 1):
po.rx = self.rx({ d: pi.bus, load: pi.ldwrx[0], clk: pi.clk }).d;
// WRITE register X to the bus (only if WRITE_X signal is 1):
pi.bus = self.buf({ d: po.rx, z: pi.bus, en: pi.ldwrx[1] });

// LOAD register Y from bus (only if LOAD_Y is 1):
po.ry = self.ry({ d: pi.bus, load: pi.ldwry[0], clk: pi.clk }).d;
// WRITE register Y to the bus (only if WRITE_Y signal is 1):
pi.bus = self.buf({ d: po.ry, z: pi.bus, en: pi.ldwry[1] });

// ADD registers X and Y, storing the result on register A:
let rar = self.ra({ a: po.rx, b: po.ry });
po.ra = rar.y;
po.rao = rar.c;
// WRITE register A to the bus (if WRITE_A signal is 1):
pi.bus = self.buf({ d: po.ra, z: pi.bus, en: pi.wra });

// LOAD register ADDR (if LOAD_ADDR signal is 1):
po.raddr = self.raddr({ d: pi.bus, load: pi.ldaddr, clk: pi.clk }).d;

// UPDATE DMEM (memory module) output signals
// (based on LOAD_ADDR and {CHIP,WRITE,OUTPUT}_EN_MEM ctrl signals):
po.dmem = self.mem({
  a: po.raddr, d: pi.bus,
  ce: pi.ceweoemem[0],
  we: pi.ceweoemem[1],
  oe: pi.ceweoemem[2],
}).d;

// WRITE DMEM output signals to the bus (if OUTPUT_EN_MEM signal is 1)
pi.bus = self.buf({ d: po.dmem, z: pi.bus, en: pi.ceweoemem[2] });

// Reusable primitives:
function definePrimitives() {
  self.fromBitStr = x => parseInt(x, 2);

  self.toBitStr = (len, x) => {
    x = x.toString(2);
    while (x.length < len) { x = '0' + x }
    return x;
  };

  self.buf = ({ d, z, en }) => +(en || 0) ? d : z;

  self.eq = len => (a, b) => {
    a = String(a);
    b = String(b);
    let acc = '';

    for (let i = 0; i < len; i++) (i => {
      let c = +!(+a[i] ^ +b[i]);
      if (!acc.length) { acc += c }
      else { acc += c & +acc[acc.length - 1] }
    })(i);

    return acc[acc.length - 1];
  };

  self.srLatch = () => {
    let q = '0';

    return ({ r, s }) => {
      r = +(r || 0);
      s = +(s || 0);
      if (r & s) { throw new Error('S-R Latch: R & S = 1') }
      if (r) { q = '0' }
      if (s) { q = '1' }
      return { q, q_: String(+!Number(q)) };
    };
  };

  self.dLatch = () => {
    let l = self.srLatch();

    return ({ d, en }) => {
      d = +(d || 0);
      en = +(en || 0);
      return l({ r: +!d & en, s: d & en });
    };
  };

  self.fallingEdgeDetector = () => {
    let last = 0;

    return x => {
      x = +(x || 0);
      let out = String((+!Number(self.eq(1)(+!last, +!x)) & +!x));
      last = x;
      return out;
    };
  };

  self.risingEdgeDetector = () => {
    let last = 0;

    return x => {
      x = +(x || 0);
      let out = String((+!Number(self.eq(1)(last, x)) & x));
      last = x;
      return out;
    };
  };

  self.dFlipFlop = ({ edge = 1 } = {}) => {
    let l = self.dLatch();
    let ed = +edge ? self.risingEdgeDetector() : self.fallingEdgeDetector();
    return ({ d, clk }) => l({ d, en: ed(clk) });
  };

  self.jkFlipFlop = ({ edge = 1 } = {}) => {
    let l = self.srLatch();
    let ed = edge ? self.risingEdgeDetector() : self.fallingEdgeDetector();
    let last = 0;

    return ({ j, k, clk }) => {
      j = +(j || 0);
      k = +(k || 0);
      let edr = ed(clk), out = l({ r: last & j & edr, s: edr & k & +!last });
      last = +out.q;
      return out;
    };
  };

  self.counter = n => {
    let ffs = [];
    for (let i = 0; i < n; i++) { ffs.push(self.jkFlipFlop({ edge: 0 })) }

    return ({ en, clk }) => {
      en = +(en || 0);
      let acc = [];

      for (let i = n - 1; i >= 0; i--) {
        acc.push(ffs[i]({
          j: en, k: en,
          clk: i === n - 1 ? +!clk : acc[n - i - 2],
        }).q);
      }

      return {
        q: acc.reverse().join(''),
        q_: acc.map(x => +!Number(x)).join(''),
      };
    };
  };

  self.reg = n => {
    let ffs = [];
    let last = [];
    for (let i = 0; i < n; i++) { ffs.push(self.dFlipFlop()); last.push(0) }

    return ({ d, load, clk }) => {
      d = String(d || ffs.map(() => 0).join(''));
      load = Number(load || 0);

      let out = ffs.map((ff, i) =>
        ff({ d: (last[i] & +!load) | (load & d[i]), clk }));

      last = out.map(x => Number(x.q));
      return { d: out.map(x => x.q).join('') };
    };
  };

  self.halfAdder = () => ({ a, b }) => {
    a = +(a || 0);
    b = +(b || 0);
    return { y: a ^ b, c: a & b };
  };

  self.fullAdder = () => {
    let ha = self.halfAdder();

    return ({ a, b, ci }) => {
      a = +(a || 0);
      b = +(b || 0);
      ci = +(ci || 0);
      let har = ha({ a, b });
      return { y: har.y ^ ci, c: (har.y & ci) | (a & b) };
    };
  };

  self.adder = n => {
    let fas = [];
    for (let i = 0; i < n; i++) { fas.push(self.fullAdder()) }

    return ({ a, b }) => {
      a = String(a || fas.map(() => 0).join(''));
      b = String(b || fas.map(() => 0).join(''));
      let y = '', c = '0';

      for (let [i, fa] of [...fas.entries()].reverse()) {
        let far = fa({ a: +a[i], b: +b[i], ci: c });
        y = far.y + y;
        c = far.c;
      }

      return { y, c };
    };
  };

  self.sramCell = () => {
    let q = '00';

    return ({ wl, bl }) => {
      wl = Number(wl || 0);

      if (bl !== '01' && bl !== '10') {
        throw new Error('sramCell, bad bl: ' + JSON.stringify(bl));
      }

      return q = wl ? bl : q;
    };
  };

  self.sram = (alen, dlen) => {
    let rows = [];

    for (let i = 0; i < (2 ** alen) / dlen; i++) {
      let r = []; for (let j = 0; j < dlen; j++) { r.push(self.sramCell()) }
      rows.push(r);
    }

    return ({ a, d, ce, we, oe }) => {
      if (typeof a !== 'string' || a.length !== alen) {
        throw new Error('sram, bad a: ' + JSON.stringify(a));
      }

      if (typeof d !== 'string' || d.length !== dlen) {
        throw new Error('sram, bad d: ' + JSON.stringify(d));
      }

      ce = Number(ce || 0);
      we = Number(we || 0);
      oe = Number(oe || 0);
      a = parseInt(a, 2);
      let dOut = [];

      for (let [i, c] of rows[a % rows.length].entries()) {
        // FIXME: Don't tie wl directly to we
        // (could probably be more realistic here, but this is good for now).
        dOut.push(ce & (we | oe)
          ? c({ wl: we, bl: [d[i], +!Number(d[i])].join('') })[0]
          : '0');
      }

      return { d: dOut.join('') };
    };
  };
}

// Logging helpers:
function logState() {
  console.log([
      'pc = %c' + po.pc + ' (' + self.fromBitStr(po.pc) + ')%c', 'clk = %c' + (pi.clk ? 'HIGH' : 'LOW') + '%c',
      '%chalf-cycle #' + self.halfCycles, 'full-cycle #' + self.fullCycles + '%c',
      '%cdecoding/executing instruction = ' + ins.join(' ') + '%c' +
      (pi.clk ? (', %cexecuted instruction = ' + (self.ins ? self.ins.join(' ') : 'nop')) : '%c'),
    ].join(', '),

    'font-weight: bold; color: salmon', 'font-weight: normal; color: unset',
    'font-weight: bold; color: ' + (pi.clk ? 'red' :'blue'), 'font-weight: unset; color: unset',
    'color: ' + (self.fullCycles > 0 ? (pi.clk ? 'red' : 'blue') : 'black'), 'color: unset',
    'color: blue', 'color: unset',
    'font-weight: bold; color: red',
  );
}
`.trim();

export default App;
