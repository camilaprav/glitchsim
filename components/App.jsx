import AceEditor from './AceEditor.jsx';
import d from '@dominant/core';
import { bem, tw } from '../css.js';

document.head.append(d.el('style', `
  .App {
    background-color: #2f272b;
  }

  .App .ace-solarized-dark {
    background-color: #002B3687;
  }

  .App-logo {
    opacity: 0.02;
    animation: App-logo-spin infinite 20s linear;
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
      grid lg:grid-cols-6 gap-6
      px-3 py-2 lg:p-24
    `,

    ctrlCol: `
      col-span-4
      flex flex-col gap-4
    `,

    hzInput: `
      w-12
      outline-none
      text-base
      bg-transparent
    `,

    editor: `
      flex-grow
    `,

    pinStateCol: `
      whitespace-pre
    `,
  });

  ctrl = {
    dbg: 1,
    hz: 1,
  };

  pinState = {
    pi: { c: join('0101', '1011') },
    po: { stack: '0' },
  };

  stepCode = stepCode;

  render = () => (
    <div model={this} class={this.css.root} style={{ minHeight: '100vh' }}>
      <div class={this.css.logoWrapper} style={{ height: '100vh' }}>
        <img src="logo.svg" class={this.css.logo} style={{ height: '40vmin' }} />
      </div>

      <div class={this.css.cols}>
        <form class={this.css.ctrlCol} values={this.ctrl}>
          <div>
            <button type="button" onClick={() => this.ctrl.dbg = +!this.ctrl.dbg}>
              dbg = {d.text(() => +Boolean(this.ctrl.dbg))}
            </button>

            {' '}{d.if(this.ctrl.dbg, (
              <button type="button" onClick={() => console.log('step')}>
                step
              </button>
            ))}

            <span hidden={this.ctrl.dbg}>
              hz = <input class={this.css.hzInput} type="text" name="hz" />
            </span>
          </div>

          <AceEditor
            class={this.css.editor}
            theme="ace/theme/solarized_dark"
            mode="ace/mode/javascript"
            content={this.stepCode}
          />
        </form>

        <code class={this.css.pinStateCol}>
          {d.text(() => JSON.stringify(this.pinState, null, 2))}
        </code>
      </div>
    </div>
  );
}

let join = (...xs) => xs.join('');

let stepCode = `if (this.state.pi.reset) {
  this.eq = len => (a, b) => {
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
  
  this.srLatch = () => {
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
  
  this.dLatch = () => {
    let l = srLatch();
  
    return ({ d, en }) => {
      d = Number(d || 0);
      en = Number(en || 0);
  
      return l({ r: +!d & en, s: d & en });
    };
  };
  
  this.highEdgeDetector = () => {
    let prev = '0';
  
    return x => {
      x = Number(x || 0);
  
      let out = String((+!Number(eq(1)(prev, x)) & x));
      prev = String(x);
  
      return out;
    };
  };

  this.state.pi.reset = '0';
}`;

export default App;