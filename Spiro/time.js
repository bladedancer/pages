  (function() {
    window.time = {
      // start + stop taken from firebuglite.js - http://getfirebug.com/firebuglite
      start: function(name) {
        if (name in timeMap) {
          throw('start: no nesting');
        } else {
		  log[name] = log[name] || 0;
          timeMap[name] = (new Date()).getTime();
        }
      },

      stop: function(name) {
        if (name in timeMap) {
          var stop = (new Date()).getTime();
          var interval = stop - timeMap[name];
          log[name] += interval;
          delete timeMap[name];
        } else {
          throw ('stop:' + name + ' not found');
        }
      },
      
      report: function() {
        console.log(log);       
      }
    };

    var timeMap = {};
    var log = {};
})();