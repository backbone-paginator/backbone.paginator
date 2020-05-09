// hack to make sure the whatever event handlers for this event is run
// before func is, and the event handlers that func will trigger.
export function runOnceAtLastHandler (col, event, func) {
  var eventHandlers = col._events[event];
  if (eventHandlers && eventHandlers.length) {
    var lastHandler = eventHandlers[eventHandlers.length - 1];
    var oldCallback = lastHandler.callback;
    lastHandler.callback = function () {
      try {
        oldCallback.apply(this, arguments);
        func();
      }
      catch (e) {
        throw e;
      }
      finally {
        lastHandler.callback = oldCallback;
      }
    };
  }
  else {
    func();
  }
}
