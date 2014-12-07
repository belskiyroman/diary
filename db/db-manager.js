var colors = require('colors');
var fs = require('fs');
var path = require('path');
var config = require('../config.js');
var data = require(config.db);

var save = function() {
    fs.writeFile(config.db, JSON.stringify(data), function(err) {
        if (err) throw err;
        console.log( colors.yellow('Data Base saved!\n\t' + new Date().toString()) );
    });
};

var merge = function (origin, addition) {
    for (var key in addition) {
        origin[key] = addition[key];
    }
    return origin;
};

var parseQuery = function (query) {
    var excess_start = new RegExp('\\' + path.sep + '*$', 'g');
    var excess_end = new RegExp('^\\' + path.sep + '*', 'g');
    var res = path.normalize(query).replace(excess_start, '').replace(excess_end, '').split(path.sep);
    return res;
};

var getTarget = function (parts_way, temp) {
    if (!parts_way.length) return temp;

    temp = temp || data;
    temp = temp[ parts_way.shift() ];

    if (temp) return getTarget(parts_way, temp);
    else return temp;
};

var getParent = function (parts_way, temp) {
    if (!parts_way.length) return temp;

    temp = temp || data;
    temp = temp[ parts_way.shift() ];

    if (temp) return getTarget(parts_way, temp);
    else return temp;
};

var get = function(query){
    if (!query) return null;
    var parts_way = parseQuery(query);
    var res = getTarget(parts_way);
    return res || null;
};

var set = function(query, newDate){
    if (!query && !newDate) return null;
    try {
        newDate = JSON.parse( JSON.stringify(newDate) ); // valid object

        var parts_way = parseQuery(query);
        var key = parts_way.pop();
        var res = getParent(parts_way);

        if (!res || res[key]) throw 'Data Base: Error set!\n\t' + query;

        res[key] = newDate;
        save();

        return newDate;
    } catch (e) {
        console.log( colors.red(e) );
        return null;
    }
};

var update = function (query, newDate) {
    if (!query && !newDate) return null;
    try {
        newDate = JSON.parse( JSON.stringify(newDate) ); // valid object

        var parts_way = parseQuery(query);
        var res = getTarget(parts_way);

        if (!res) throw 'Data Base: Error update!\n\t' + query;

        res = merge(res, newDate);
        save();

        return res;
    } catch (e) {
        console.log( colors.red(e) );
        return null;
    }
};

var destroy = function(query){
    if (!query) return null;
    try {
        var parts_way = parseQuery(query);
        var key = parts_way.pop();
        var res = getParent(parts_way);
        var old_data;

        if (!res || !res[key]) throw 'Data Base: Error destroy!\n\t' + query;

        old_data = res[key];
        delete res[key];
        save();

        return old_data;
    } catch (e) {
        console.log( colors.red(e) );
        return null;
    }
};

module.exports = {
    get: get,
    set: set,
    update: update,
    destroy: destroy
};
