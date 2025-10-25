// Module initialization
console.log('Todo Manager module loaded successfully!');

// This will be called when the module is executed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init: function() {
      console.log('Todo Manager initialized');
    }
  };
}