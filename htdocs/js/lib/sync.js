Backbone.sync = function (method, model, options) {
    // grab active socket from global namespace; io.connect() was used to create socket
    var socket = window.NAMESPACE.socket;

    /*
     * Create signature object that will emitted to server with every request.
     * This is used on the server to push an event back to the client listener.
     */
    var signature = function (model) {
        var sig = {};

        sig.endPoint = _.isFunction(model.url) ? model.url() : model.url;
        if (model.ctx) sig.ctx = model.ctx;

        return sig;
    };

    /*
     * Create an event listener for server push. The server notifies
     * the client upon success of CRUD operation.
     */
    var getListener = function (operation, sig) {
        var e = operation + ':';
        e += sig.endPoint;
        if (sig.ctx) e += (':' + sig.ctx);

        return e;
    };

    var callback = function (data) {
        if (data.success && options.success && _.isFunction(options.success)) {
            options.success(data.response);
        }
        else if (data.success && options.error && _.isFunction(options.error)) {
            options.error(data.response);
        }
    }

    // Save a new model to the server.
    var create = function () {
        var sign = signature(model);
        var e = getListener('create', sign);
        socket.emit('create', {'signature' : sign, item : model.attributes });
        socket.once(e, function (data) {
            callback(data);
        });
    };

    // Get a collection or model from the server.
    var read = function () {
        var sign = signature(model);
        var e = getListener('read', sign);
        socket.emit('read', {'signature' : sign});
        socket.once(e, function (data) {
            callback(data); // updates collection, model; fetch
        });
    };

    // Save an existing model to the server.
    var update = function () {
        var sign = signature(model);
        var e = getListener('update', sign);
        socket.emit('update', {'signature' : sign, item : model.attributes }); // model.attribues is the model data
        socket.once(e, function (data) {
            console.log(data);
            callback(data);
        });
    };

    // Delete a model on the server.
    var destroy = function () {
        var sign = signature(model);
        var e = getListener('delete', sign);
        socket.emit('delete', {'signature' : sign, item : model.attributes }); // model.attribues is the model data
        socket.once(e, function (data) {
            console.log(data);
            callback(data);
        });
    };

    // entry point for method
    switch (method) {
        case 'create':
            create();
            break;
        case 'read':
            read();
            break;
        case 'update':
            update();
            break;
        case 'delete':
            destroy();
            break;
    }
};
