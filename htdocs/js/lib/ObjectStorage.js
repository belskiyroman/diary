function addEvent(obj, event_name, handler) {
  var handler_wrapper = function(event) {
        event = event || window.event;
        if (!event.target && event.srcElement) {
          event.target = event.srcElement;
        }
        return handler.call(obj, event);
      };

  if (obj.addEventListener) {
    obj.addEventListener(event_name, handler_wrapper, false);
  } else if (obj.attachEvent) {
    obj.attachEvent('on' + event_name, handler_wrapper);
  }
  return handler_wrapper;// cross-browser function of the event
}

var ObjectStorage = function ObjectStorage( name, duration ) {
    var self,
        name = name || '_objectStorage',
        defaultDuration = 5000;

    // дабы не плодить кучу экземпляров, использующих один и тот же ключ хранилища,
    // просто возвращаем единственный с заданным именем,
    // меняя только duration (если имеется)
    if ( ObjectStorage.instances[ name ] ) {
        self = ObjectStorage.instances[ name ];
        self.duration = duration || self.duration;
    } else {
        self = this;
        self._name = name;
        self.duration = duration || defaultDuration;
        self._init();
        ObjectStorage.instances[ name ] = self;
    }

    return self;
};

ObjectStorage.instances = {};

ObjectStorage.prototype = {
    // type == local || session
    _save: function ( type ) {
        if (window[ type + 'Storage' ]) return;
        var stringified = JSON.stringify( this[ type ] ),
            storage = window[ type + 'Storage' ];
        if ( storage.getItem( this._name ) !== stringified ) {
            storage.setItem( this._name, stringified );
        }
    },

    _get: function ( type ) {
        if (window[ type + 'Storage' ]) {
            return this[ type ] = {};
        }
        this[ type ] = JSON.parse( window[ type + 'Storage' ].getItem( this._name ) ) || {};
    },

    _init: function () {
        var self = this;
        self._get( 'local' );
        self._get( 'session' );

        ( function callee() {
            self.timeoutId = setTimeout( function () {
                self._save( 'local' );
                callee();
            }, self._duration );
        })();

        addEvent(window, 'beforeunload', function () {
            self._save( 'local' );
            self._save( 'session' );
        });
    },
    // на случай, если нужно удалить таймаут (clearTimeout( storage.timeoutId ))
    timeoutId: null,
    local: {},
    session: {}
};

