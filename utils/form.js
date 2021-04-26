import d from '@dominant/core';

function nullish(x) { return x === undefined || x === null }

function valuesBindingUpdate() {
  var self = this, newValues = d.resolve(self.get), k, v;

  if (!self.changeHandler) {
    self.changeHandler = function(ev) {
      k = ev.target.name;

      if (!k) { return }
      d.resolve(self.get)[k] = self.lastValues[k] = getFormValue(self.target, k);

      d.updateSync();
    };

    self.target.addEventListener('change', self.changeHandler);
    self.target.addEventListener('keyup', self.changeHandler);
  }

  self.lastValues = self.lastValues || {};

  for (k in self.lastValues) {
    if (!self.lastValues.hasOwnProperty(k)) { continue }
    if (newValues.hasOwnProperty(k)) { continue }

    setFormValue(self.target, k, null);
  }

  for (k in newValues) {
    if (!newValues.hasOwnProperty(k)) { continue }

    v = newValues[k];
    if (shallowEq(self.lastValues[k], v)) { continue }

    setFormValue(self.target, k, v);
  }

  self.lastValues = deepClone(newValues);
}

function getFormValue(form, name) {
  var i, value;
  var inputs = form.querySelectorAll('input[name="' + name + '"]'), input;

  for (i = 0; i < inputs.length; i++) {
    input = inputs[i];

    switch (input.type) {
      case 'button':
      case 'file':
      case 'submit':
        break;

      case 'radio':
        if (input.checked) { value = input.getAttribute('value') || true }
        break;

      case 'checkbox':
        if (i === 0 && inputs.length > 1) { value = {} }

        if (typeof value !== 'object') {
          if (input.getAttribute('value')) {
            value = input.checked ? input.value : null;
          } else {
            value = input.checked;
          }
        } else if (input.getAttribute('value')) {
          value[input.value] = input.checked;
        }

        break;

      default:
        value = input.value;
        break;
    }
  }

  return value;
}

function setFormValue(form, name, value) {
  var i, inputs = form.querySelectorAll('input[name="' + name + '"]'), input;

  for (i = 0; i < inputs.length; i++) {
    input = inputs[i];

    switch (input.type) {
      case 'radio':
      case 'checkbox':
        if (nullish(value)) {
          input.checked = false;
          continue;
        }

        if (input.getAttribute('value')) {
          input.checked = typeof value !== 'object'
            ? String(value) === input.value
            : value[input.value];
        } else if (typeof value !== 'object') {
          input.checked = value;
        }

        break;

      default:
        input.value = !nullish(value) ? value : '';
        break;
    }
  }
}

d.Binding.specialUpdateFnsByKey.values = valuesBindingUpdate;

export default valuesBindingUpdate;
export { getFormValue, setFormValue };

// Helpers:
function deepClone(x) {
  var k, y;

  if (Array.isArray(x)) { return x.map(deepClone) }

  if (typeof x === 'object') {
    y = {};
    for (k in x) { y[k] = deepClone(x[k]) }

    return y;
  }

  return x;
}

function shallowEq(a, b) {
  var i, k;

  if (a === b) { return true }

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) { return false }

    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) { return false }
    }

    return true;
  }

  if (typeof a === 'object') {
    if (typeof b !== 'object' || !b) { return false }
    if (Object.keys(a).length !== Object.keys(b).length) { return false }

    for (k in a) {
      if (!a.hasOwnProperty(k)) { continue }
      if (a[k] !== b[k]) { return false }
    }

    return true;
  }

  return false;
}