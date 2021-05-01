import AceEditor from './AceEditor.jsx';
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
    min-height: 70vh;
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

  stepCode = stepCode;

  onStep = () => {
    try {
      (new Function(this.stepCode)).call(this);
    } catch (err) {
      console.error(err);
      this.ctrl.dbg = 1;
    }

    d.update();
  };

  render = () => (
    <div model={this} class={this.css.root} style={{ minHeight: '100vh' }}>
      <div class={this.css.logoWrapper} style={{ height: '100vh' }}>
        <img src="logo.svg" class={this.css.logo} style={{ height: '40vmin' }} />
      </div>

      <form class={this.css.cols} values={this.ctrl}>
        <AceEditor
          class={this.css.editor}
          theme="ace/theme/monokai"
          mode="ace/mode/javascript"
          content={this.stepCode}
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
  self.ra = self.reg(8);
  self.rb = self.reg(8);
  self.ry = self.adder(8);
  self.raddr = self.reg(8);
  self.mem = self.sram(8, 8); // 256 bytes total

  // Reset/initialize "input pins"
  // (plus the bus, which is is a string of "read/write pins"):
  pi = self.pi = {
    reset: '0',
    clk: '1',
    ldwrincpc: '000',
    ldwra: '00',
    ldwrb: '00',
    wry: '0',
    ldaddr: '0',
    ceweoemem: '000',
    bus: '00000000',
  };

  self.cycles = 0;
}

// Step code:
pi.clk = +!Number(pi.clk); if (!pi.clk) { self.cycles++ }

switch (self.cycles) {
  case 0: break;

  case 1:
    console.log(pi.clk, self.cycles, 'increment pc (00000001), load pc on ra');

    if (!pi.clk) {
      pi.ldwrincpc = '011';
      pi.ldwra = '10';
    } else {
      requestAnimationFrame(() => {
        console.assert(po.pc === '00000001', 'pc must be 00000001, got', po.pc);
        console.assert(po.ra === '00000001', 'ra must be 00000001, got', po.ra);
      });
    }

    break;

  case 2:
    console.log(pi.clk, self.cycles, 'increment pc (00000010), load pc on rb');

    if (!pi.clk) {
      pi.ldwrincpc = '011';
      pi.ldwra = '00';
      pi.ldwrb = '10';
    } else {
      requestAnimationFrame(() => {
        console.assert(po.pc === '00000010', 'pc must be 00000010, got', po.pc);
        console.assert(po.ra === '00000001', 'ra must be 00000001, got', po.ra);
        console.assert(po.rb === '00000010', 'rb must be 00000010, got', po.rb);
      });
    }

    break;

  case 3:
    console.log(pi.clk, self.cycles, 'increment pc (00000011), otherwise idle');

    if (!pi.clk) {
      pi.ldwrincpc = '001';
      pi.ldwrb = '00';
    }  else {
      requestAnimationFrame(() => {
        console.assert(po.pc === '00000011', 'pc must be 00000011, got', po.pc);
        console.assert(po.ra === '00000001', 'ra must be 00000001, got', po.ra);
        console.assert(po.rb === '00000010', 'rb must be 00000010, got', po.rb);
      });
    }

    break;

  case 4:
    console.log(pi.clk, self.cycles, 'load ra (00000001) into raddr');

    if (!pi.clk) {
      pi.ldwrincpc = '000';
      pi.ldwra = '01';
      pi.ldaddr = '1';
    } else {
      requestAnimationFrame(() => {
        console.assert(po.pc === '00000011', 'pc must be 00000011, got', po.pc);
        console.assert(po.ra === '00000001', 'ra must be 00000001, got', po.ra);
        console.assert(po.raddr === '00000001', 'raddr must be 00000001, got', po.raddr);
      });
    }

    break;

  case 5:
    console.log(pi.clk, self.cycles, 'write rb (00000010) to mem @ raddr (00000001)');

    if (!pi.clk) {
      console.assert(po.raddr === '00000001', 'raddr must be 00000001, got', po.raddr);
      pi.ldwra = '00';
      pi.ldwrb = '01';
      pi.ldaddr = '0';
      pi.ceweoemem = '110';
    } else {
      requestAnimationFrame(() => {
        console.assert(po.pc === '00000011', 'pc must be 00000011, got', po.pc);
        console.assert(po.rb === '00000010', 'rb must be 00000010, got', po.rb);
        console.assert(po.raddr === '00000001', 'raddr must be 00000001, got', po.raddr);
        console.assert(po.dmem === '00000010', 'dmem must be 00000010, got', po.dmem);
      });
    }

    break;

  case 6:
    console.log(pi.clk, self.cycles, 'load rb (00000010) into raddr');

    if (!pi.clk) {
      pi.ldwra = '00';
      pi.ldwrb = '01';
      pi.ldaddr = '1';
      pi.ceweoemem = '000';
    } else {
      requestAnimationFrame(() => {
        console.assert(po.pc === '00000011', 'pc must be 00000011, got', po.pc);
        console.assert(po.rb === '00000010', 'rb must be 00000010, got', po.rb);
        console.assert(po.raddr === '00000010', 'raddr must be 00000010, got', po.raddr);
      });
    }

    break;

  case 7:
    console.log(pi.clk, self.cycles, 'write ra (00000001) to mem @ raddr (00000010)');

    if (!pi.clk) {
      console.assert(po.raddr === '00000010', 'raddr must be 00000010, got', po.raddr);
      pi.ldwra = '01';
      pi.ldwrb = '00';
      pi.ldaddr = '0';
      pi.ceweoemem = '110';
    } else {
      requestAnimationFrame(() => {
        console.assert(po.pc === '00000011', 'pc must be 00000011, got', po.pc);
        console.assert(po.ra === '00000001', 'ra must be 00000001, got', po.ra);
        console.assert(po.raddr === '00000010', 'raddr must be 00000010, got', po.raddr);
        console.assert(po.dmem === '00000001', 'raddr must be 00000001, got', po.raddr);
      });
    }

    break;

  case 8:
    console.log(pi.clk, self.cycles, 'clear regs');

    if (!pi.clk) {
      pi.bus = '00000000';
      pi.ldwrincpc = '100'; // FIXME
      pi.ldwra = '10';
      pi.ldwrb = '10';
      pi.ldaddr = '1';
      pi.ceweoemem = '000';
    } else {
      requestAnimationFrame(() => {
        //console.assert(po.pc === '00000000', 'pc must be 00000000, got', po.pc);
        console.assert(po.ra === '00000000', 'ra must be 00000000, got', po.ra);
        console.assert(po.rb === '00000000', 'rb must be 00000000, got', po.rb);
        console.assert(po.raddr === '00000000', 'raddr must be 00000000, got', po.raddr);
      });
    }

    break;

  case 9:
    console.log(pi.clk, self.cycles, 'set raddr to 00000001');

    if (!pi.clk) {
      pi.bus = '00000001';
      pi.ldwrincpc = '000';
      pi.ldwra = '00';
      pi.ldwrb = '00';
      pi.ldaddr = '1';
    } else {
      requestAnimationFrame(() => {
        //console.assert(po.pc === '00000000', 'pc must be 00000000, got', po.pc);
        console.assert(po.ra === '00000000', 'ra must be 00000000, got', po.ra);
        console.assert(po.rb === '00000000', 'rb must be 00000000, got', po.rb);
        console.assert(po.raddr === '00000001', 'raddr must be 00000001, got', po.raddr);
      });
    }

    break;

  case 10:
    console.log(pi.clk, self.cycles, 'read mem @ raddr (00000001) to ra');

    if (!pi.clk) {
      console.assert(po.raddr === '00000001', 'raddr must be 00000001, got', po.raddr);
      pi.ldwra = '10';
      pi.ldwrb = '00';
      pi.ldaddr = '0';
      pi.ceweoemem = '101';
    } else {
      requestAnimationFrame(() => {
        //console.assert(po.pc === '00000000', 'pc must be 00000000, got', po.pc);
        console.assert(po.ra === '00000010', 'ra must be 00000010, got', po.ra);
        console.assert(po.rb === '00000000', 'rb must be 00000000, got', po.rb);
        console.assert(po.raddr === '00000001', 'raddr must be 00000001, got', po.raddr);
        console.assert(po.dmem === '00000010', 'dmem must be 00000010, got', po.dmem);
      });
    }

    break;

  case 11:
    console.log(pi.clk, self.cycles, 'set raddr to 00000010');

    if (!pi.clk) {
      pi.bus = '00000010';
      pi.ldwra = '00';
      pi.ldwrb = '00';
      pi.ldaddr = '1';
      pi.ceweoemem = '000';
    } else {
      requestAnimationFrame(() => {
        //console.assert(po.pc === '00000000', 'pc must be 00000000, got', po.pc);
        console.assert(po.ra === '00000010', 'ra must be 00000010, got', po.ra);
        console.assert(po.rb === '00000000', 'rb must be 00000000, got', po.rb);
        console.assert(po.raddr === '00000010', 'raddr must be 00000010, got', po.raddr);
      });
    }

    break;

  case 12:
    console.log(pi.clk, self.cycles, 'read mem @ raddr (00000010) to rb');

    if (!pi.clk) {
      console.assert(po.raddr === '00000010', 'raddr must be 00000010, got', po.raddr);
      pi.ldwra = '00';
      pi.ldwrb = '10';
      pi.ldaddr = '0';
      pi.ceweoemem = '101';
    } else {
      requestAnimationFrame(() => {
        //console.assert(po.pc === '00000000', 'pc must be 00000000, got', po.pc);
        console.assert(po.ra === '00000010', 'ra must be 00000010, got', po.ra);
        console.assert(po.rb === '00000001', 'rb must be 00000001, got', po.rb);
        console.assert(po.raddr === '00000010', 'raddr must be 00000010, got', po.raddr);
        console.assert(po.dmem === '00000001', 'dmem must be 00000001, got', po.dmem);
      });
    }

    break;

  case 13:
    console.log(pi.clk, self.cycles, 'nop');
    pi.ldwra = '00';
    pi.ldwrb = '00';
    pi.ceweoemem = '000';
    break;

  case -1:
    console.log(pi.clk, -1, 'custom step');
    pi.ldwrincpc = '000';
    pi.ldwra = '00';
    pi.ldwrb = '00';
    pi.wry = '0';
    pi.ldaddr = '0';
    pi.ceweoemem = '000';
    //pi.bus = '00000001';
    break;
}

po.pc = self.pc({ en: pi.ldwrincpc[2], clk: pi.clk }).q;
pi.bus = self.buf({ d: po.pc, z: pi.bus, en: pi.ldwrincpc[1] });

po.ra = self.ra({ d: pi.bus, load: pi.ldwra[0], clk: pi.clk }).d;
pi.bus = self.buf({ d: po.ra, z: pi.bus, en: pi.ldwra[1] });

po.rb = self.rb({ d: pi.bus, load: pi.ldwrb[0], clk: pi.clk }).d;
pi.bus = self.buf({ d: po.rb, z: pi.bus, en: pi.ldwrb[1] });

let ryr = self.ry({ a: po.ra, b: po.rb });
po.ry = ryr.y;
po.ryo = ryr.c;
pi.bus = self.buf({ d: po.ry, z: pi.bus, en: pi.wry });

po.raddr = self.raddr({ d: pi.bus, load: pi.ldaddr, clk: pi.clk }).d;

po.dmem = self.mem({
  a: po.raddr, d: pi.bus,
  ce: pi.ceweoemem[0],
  we: pi.ceweoemem[1],
  oe: pi.ceweoemem[2],
}).d;

pi.bus = self.buf({ d: po.dmem, z: pi.bus, en: pi.ceweoemem[2] });

// Reusable primitives:
function definePrimitives() {
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
`.trim();

export default App;