import d from '@dominant/core';

document.head.append(d.el('style', `
  .App {
    min-height: 100vh;
    color: white;
    background-color: #2f272b;
  }

  .App-logoWrapper {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .App-logo {
    height: 40vmin;
    opacity: 0.02;
    pointer-events: none;
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
  render = () => (
    <div model={this} class="App">
      <div class="App-logoWrapper">
        <img src="logo.svg" class="App-logo" alt="logo" />
      </div>
    </div>
  );
}

export default App;