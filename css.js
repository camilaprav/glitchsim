import { tw } from 'twind';

function bem(block, els) {
  let ret = {};

  for (let [k, v] of Object.entries(els)) {
    Object.defineProperty(ret, k, {
      get: () => {
        let fn = (...args) => {
          if (typeof v === 'function') { v = v(...args || []) }

          let ret = [[block, k !== 'root' && k].filter(Boolean).join('-'), ...tw(v).split(/\s/)];
          let override = (ret.overrides || {})[k];

          if (override) {
            if (typeof override === 'function') { override = override(...args || []) }
            override = override.trim().split(/\s/).map(x => x.trim()).filter(Boolean);;

            for (let x of override) {
              let neg = x.startsWith('-');
              let atom = x.split('-')[neg ? 1 : 0];
              console.log(atom);

              ret = ret.filter(y => !y.startsWith(atom));
              if (!neg) { ret.push(tw(x)) }
            }
            console.log(ret);
          }

          return ret.join(' ');
        };

        fn.toString = () => fn();

        return fn;
      },
    });
  }

  return ret;
}

export { bem, tw };