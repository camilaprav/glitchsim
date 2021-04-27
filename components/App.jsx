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
    min-height: 80vh;
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
      grid lg:grid-cols-6 lg:gap-24
      lg:px-3 lg:py-2 lg:p-24
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

  state = {
    pi: { reset: '1' },
    po: {},
  };

  stepCode = stepCode;

  onStep = () => {
    (new Function(this.stepCode)).call(this);
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
            <button
              class={this.css.btn}
              type="button"
              onClick={() => this.state.pi.reset = String(+!Number(this.state.pi.reset))}
            >
              reset = {d.text(() => this.state.pi.reset)}
            </button>
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
              >
                step
              </button>
            ))}

            <span hidden={this.ctrl.dbg}>
              hz = <input class={this.css.hzInput} type="text" name="hz" />
            </span>
          </div>

          <pre><code>{d.text(() => JSON.stringify(this.state, null, 2))}</code></pre>
        </div>
      </form>
    </div>
  );
}

let stepCode = `let self = this;

if (Number(self.state.pi.reset)) {
  createPrimitives();
  instantiate();

  self.state.pi = {
    reset: '0',
    c: self.join('0101', '1011'),
  };
}

// Step code:
self.state.po.stack = self.eq5b(self.state.pi.c);

// Setup code:
function instantiate() {
  self.eq5b = x => self.eq(8)(self.join('0101', '1011'), x);

  let hed = self.highEdgeDetector();
  console.log(hed(0)); // 0
  console.log(hed(0)); // 0
  console.log(hed(1)); // 1
  console.log(hed(1)); // 0
  console.log(hed(1)); // 0
  console.log(hed(0)); // 0
  console.log(hed(1)); // 1
  console.log(hed(1)); // 0

  let latches = { sr: self.srLatch(), d: self.dLatch(), dff: self.dFlipFlop() };

  console.log('sr:', latches.sr({ r: 0, s: 0 }).q); // 1
  console.log('sr:', latches.sr({ r: 1, s: 0 }).q); // 0
  console.log('sr:', latches.sr({ r: 0, s: 0 }).q); // 0
  console.log('sr:', latches.sr({ r: 0, s: 1 }).q); // 1
  console.log('sr:', latches.sr({ r: 0, s: 0 }).q); // 1

  console.log('d:', latches.d({ d: 0, en: 0 }).q); // 1
  console.log('d:', latches.d({ d: 0, en: 1 }).q); // 0
  console.log('d:', latches.d({ d: 0, en: 0 }).q); // 0
  console.log('d:', latches.d({ d: 1, en: 0 }).q); // 0
  console.log('d:', latches.d({ d: 0, en: 0 }).q); // 0
  console.log('d:', latches.d({ d: 1, en: 1 }).q); // 1
  console.log('d:', latches.d({ d: 0, en: 0 }).q); // 1
  console.log('d:', latches.d({ d: 0, en: 1 }).q); // 0
  console.log('d:', latches.d({ d: 0, en: 0 }).q); // 0

  console.log('dff:', latches.dff({ d: 0, clk: 0 }).q); // 1
  console.log('dff:', latches.dff({ d: 0, clk: 1 }).q); // 0
  console.log('dff:', latches.dff({ d: 0, clk: 0 }).q); // 0
  console.log('dff:', latches.dff({ d: 1, clk: 0 }).q); // 0
  console.log('dff:', latches.dff({ d: 0, clk: 0 }).q); // 0
  console.log('dff:', latches.dff({ d: 1, clk: 1 }).q); // 1
  console.log('dff:', latches.dff({ d: 0, clk: 0 }).q); // 1
  console.log('dff:', latches.dff({ d: 0, clk: 1 }).q); // 0
  console.log('dff:', latches.dff({ d: 0, clk: 0 }).q); // 0

  console.log('dff:', latches.dff({ d: 1, clk: 1 }).q); // 1
  console.log('dff:', latches.dff({ d: 0, clk: 1 }).q); // 1
  console.log('dff:', latches.dff({ d: 1, clk: 1 }).q); // 1
  console.log('dff:', latches.dff({ d: 0, clk: 1 }).q); // 1
  console.log('dff:', latches.dff({ d: 1, clk: 0 }).q); // 1
  console.log('dff:', latches.dff({ d: 0, clk: 1 }).q); // 0
  console.log('dff:', latches.dff({ d: 1, clk: 1 }).q); // 0
  console.log('dff:', latches.dff({ d: 1, clk: 0 }).q); // 0
  console.log('dff:', latches.dff({ d: 1, clk: 1 }).q); // 1
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
    let q = '1';

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
}`;

export default App;