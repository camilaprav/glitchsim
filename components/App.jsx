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
    pause: 1,
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
      this.ctrl.pause = 1;
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
              onClick={() => this.ctrl.pause = +!this.ctrl.pause}
            >
              pause = {d.text(() => +Boolean(this.ctrl.pause))}
            </button>
            {' '}
            {d.if(this.ctrl.pause, (
              <button
                class={this.css.btn}
                type="button"
                onClick={this.onStep}
                children="step"
              />
            ))}
            {' '}
            <span hidden={this.ctrl.pause}>
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

let stepCode = `let self = this;
let { pi, po } = self;

// Only executes when reset pin is high (executes setup/reset logic):
if (Number(pi.reset)) {
  createPrimitives();
  instantiate();
  reset();
}

// Step code:
pi.clk = +!Number(pi.clk);

pi.lda = '0';
pi.ldb = '0';

pi.bus = '11110000';

po.ra = self.ra({ d: pi.bus, load: pi.lda, clk: pi.clk });
po.rb = self.rb({ d: pi.bus, load: pi.ldb, clk: pi.clk });

let ryr = self.ry({ a: po.ra, b: po.rb });
po.ry = ryr.y;
po.ryo = ryr.c;

// Setup code:
function reset() {
  pi = self.pi = {
    reset: '0',
    clk: '1',

    lda: '0',
    ldb: '0',

    bus: '00000000',
  };
}

function instantiate() {
  self.ra = self.reg(8);
  self.rb = self.reg(8);
  self.ry = self.adder(8);
}

function createPrimitives() {
  self.join = (...xs) => xs.join('');

  self.eq = len => (a, b) => {
    a = String(a);
    b = String(b);

    let acc = '';

    for (let i = 0; i < len; i++) (i => {
      let c = +!(Number(a[i]) ^ Number(b[i]));

      if (!acc.length) { acc += c }
      else { acc += c & Number(acc[acc.length - 1]) }
    })(i);

    return acc[acc.length - 1];
  };

  self.srLatch = () => {
    let q = '0';

    return ({ r, s }) => {
      r = Number(r || 0);
      s = Number(s || 0);

      if (r & s) { throw new Error('S-R Latch: R & S = 1') }

      if (r) { q = '0' }
      if (s) { q = '1' }

      return { q, q_: String(+!Number(q)) };
    };
  };

  self.dLatch = () => {
    let l = self.srLatch();

    return ({ d, en }) => {
      d = Number(d || 0);
      en = Number(en || 0);

      return l({ r: +!d & en, s: d & en });
    };
  };

  self.highEdgeDetector = () => {
    let prev = '0';

    return x => {
      x = Number(x || 0);

      let out = String((+!Number(self.eq(1)(prev, x)) & x));
      prev = String(x);

      return out;
    };
  };

  self.dFlipFlop = () => {
    let l = self.dLatch();
    let highEdge = self.highEdgeDetector();

    return ({ d, clk }) => l({ d, en: highEdge(clk) });
  };

  self.regbit = () => {
    let dff = self.dFlipFlop();
    let last = 0;

    return ({ d, load, clk }) => {
      d = Number(d || 0);
      load = Number(load || 0);

      let out = dff({ d: (last & +!load) | (load & d), clk });
      prev = out.q;

      return out;
    };
  };

  self.reg = n => {
    let bits = [];
    for (let i = 0; i < n; i++) { bits.push(self.regbit()) }

    return ({ d, load, clk }) => {
      d = String(d || bits.map(() => 0).join(''));
      return bits.map((bit, i) => bit({ d: Number(d[i]), load, clk }).q).join('');
    };
  };

  self.halfAdder = () => ({ a, b }) => {
    a = Number(a || 0);
    b = Number(b || 0);
    return { y: a ^ b, c: a & b };
  };

  self.fullAdder = () => {
    let ha = self.halfAdder();

    return ({ a, b, ci }) => {
      a = Number(a || 0);
      b = Number(b || 0);
      ci = Number(ci || 0);

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

      for (let [i, fa] of fas.entries()) {
        let far = fa({ a: Number(a[i]), b: Number(b[i]), ci: c });
        y += far.y;
        c = far.c;
      }

      return { y, c };
    };
  };
}`;

export default App;