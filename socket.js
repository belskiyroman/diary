var db = require('./db/db-manager.js');
var config = require('./config.js');

module.exports = function(server){
    var io = require('socket.io')(server);

    var read = function (socket, signature) {
        var endPoint = signature.endPoint;
        var e = getListener('read', signature);
        var data = db.get(endPoint);
        var success = data ? true : false;

        socket.emit(e, {
            success: success,
            response: data
        });
    };

    var create = function (socket, signature, model) {
        model._id = model.date = new Date().valueOf();
        var endPoint = signature.endPoint.replace(/\/?$/, '/' + model._id);
        var e = getListener('create', signature);
        var data = db.set(endPoint, model);
        var success = data ? true : false;
        var id = data ? data._id : null;

        socket.emit(e, {
            success: success,
            response: data
        });
        if (success) socket.broadcast.emit('create', {response: data});
    };

    var update = function (socket, signature, model) {
        var endPoint = signature.endPoint;
        var e = getListener('update', signature);
        var data = db.update(endPoint, model);
        var success = data ? true : false;

        socket.emit(e, {
            success: success,
            response: data
        });
        if (success) socket.broadcast.emit('update', {response: data});
    };

    var destroy = function (socket, signature, model) {
        var endPoint = signature.endPoint;
        var e = getListener('delete', signature);
        var data = db.destroy(endPoint);
        var success = data ? true : false;

        socket.emit(e, {
            success: success,
            response: data
        });
        if (success) socket.broadcast.emit('delete', {response: data});
    };

    // creates the event to push to listening clients
    var getListener = function (operation, sig) {
        var e = operation + ':';
        e += sig.endPoint;
        if (sig.ctx) e += (':' + sig.ctx);

        return e;
    };

    io.on('connection', function (socket) {
        socket.on('read', function (data) {
            read(socket, data.signature);
        });
        socket.on('create', function (data) {
            create(socket, data.signature, data.item);
        });
        socket.on('update', function (data) {
            update(socket, data.signature, data.item);
        });
        socket.on('delete', function (data) {
            destroy(socket, data.signature, data.item);
        });
    });



};
