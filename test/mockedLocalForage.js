const localforage = Object.freeze((function() {
  let store = {};
  return {
    getItem: function(key) {
      return Promise.resolve(store[key] || null);
    },
    setItem: function(key, value) {
      store[key] = value.toString();
      return Promise.resolve();
    },
    removeItem: function(key) {
      delete store[key];
      return Promise.resolve();
    },
    clear: function() {
      store = {}
      return Promise.resolve();
    }
  };
})());