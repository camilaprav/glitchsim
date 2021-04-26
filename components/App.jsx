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
    `,

    logo: `
      pointer-events-none
    `,

    cols: `
      grid grid-cols-3 gap-6
      p-8
    `,

    ctrlCol: `
      col-span-2
    `,

    outCol: `
      whitespace-pre
    `,
  });

  out = {};

  get jsonOut() {
    return JSON.stringify(this.out, null, 2);
  }

  render = () => (
    <div model={this} class={this.css.root} style={{ minHeight: '100vh' }}>
      <div class={this.css.logoWrapper} style={{ height: '100vh' }}>
        <img src="logo.svg" class={this.css.logo} style={{ height: '40vmin' }} />
      </div>

      <div class={this.css.cols}>
        <div class={this.css.ctrlCol}>
          Hello, world!
        </div>

        <code class={this.css.outCol}>
          <div class={tw`mb-6 text-center`}>Output</div>
          {d.text(() => this.jsonOut)}
        </code>
      </div>
    </div>
  );
}

export default App;