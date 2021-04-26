import d from '@dominant/core';
import { bem, tw } from '../css.js';

document.head.append(d.el('style', `
  .App {
    background-color: #2f272b;
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
      grid grid-cols-5 gap-6
      p-8
    `,

    ctrlCol: `
      col-span-3
    `,

    opsInput: `
      w-12
      outline-none
      text-base
      bg-transparent
    `,

    pinStateCol: `
      whitespace-pre
    `,
  });

  ctrl = {
    dbg: 0,
    ops: 1,
  };

  pinState = {
    pi: { c: join('0101', '1011') },
    po: { stack: '0' },
  };

  get jsonPinState() {
    return JSON.stringify(this.pinState, null, 2);
  }

  render = () => (
    <div model={this} class={this.css.root} style={{ minHeight: '100vh' }}>
      <div class={this.css.logoWrapper} style={{ height: '100vh' }}>
        <img src="logo.svg" class={this.css.logo} style={{ height: '40vmin' }} />
      </div>

      <div class={this.css.cols}>
        <form class={this.css.ctrlCol} values={this.ctrl}>
          <button type="button" onClick={() => this.ctrl.dbg = +!this.ctrl.dbg}>
            dbg = {d.text(() => +Boolean(this.ctrl.dbg))}
          </button>

          {' '}{d.if(this.ctrl.dbg, (
            <button type="button" onClick={() => console.log('step')}>
              step
            </button>
          ))}

          <span hidden={this.ctrl.dbg}>
            ops = <input class={this.css.opsInput} type="text" name="ops" />
          </span>
        </form>

        <code class={this.css.pinStateCol}>
          {d.text(() => this.jsonPinState)}
        </code>
      </div>
    </div>
  );
}

let join = (...xs) => xs.join('');

export default App;