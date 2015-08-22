var tests = [];
for (var file in window.__karma__.files) {
  if (/_spec\.js$/.test(file)) {
    tests.push(file);
  }
}

requirejs.config({
  baseUrl: '',

  paths: {},

  shim: {},

  deps: tests,

  callback: window.__karma__.start
});
