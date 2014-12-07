this["JST"] = this["JST"] || {};

this["JST"]["record-item.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<a href="#records/' +
((__t = ( id )) == null ? '' : __t) +
'" class="header ellipsis">' +
((__t = ( title )) == null ? '' : __t) +
'</a>\r\n<p class="record-create-date">' +
((__t = ( new Date(date).toString('dd/MM/yyyy') )) == null ? '' : __t) +
'</p>\r\n<i class="fa fa-times remove"></i>\r\n\r\n';

}
return __p
};

this["JST"]["record-new.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h1 class="text-center header-2">' +
((__t = ( (body ? 'Редактирование Записи' : 'Новая Запись') )) == null ? '' : __t) +
'</h1>\r\n<input type="text" class="title-record" tabindex="1" autofocus value="' +
((__t = ( title || '' )) == null ? '' : __t) +
'">\r\n<textarea class="body-record" tabindex="2">' +
((__t = ( body || '' )) == null ? '' : __t) +
'</textarea>\r\n<button class="btn-2 send" tabindex="3">Ок</button>\r\n\r\n';

}
return __p
};

this["JST"]["record-once.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h1 class="text-center header-2">' +
((__t = ( title )) == null ? '' : __t) +
'</h1>\r\n<p class="record-body">' +
((__t = ( body )) == null ? '' : __t) +
'</p>\r\n<p class="record-once-date-create">' +
((__t = ( new Date(date).toString('dd.MM.yyyy  (hh:mm)') )) == null ? '' : __t) +
'</p>\r\n\r\n';

}
return __p
};

this["JST"]["sidebar.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<ul>\r\n    <li class="btn item">\r\n        <a href="#records" class="link-bloсk"><i class="fa fa-newspaper-o"></i><span class="text-btn">Все записи</span></a>\r\n    </li>\r\n\r\n    <li class="btn item">\r\n        <a href="#write" class="link-bloсk"><i class="fa fa-plus"></i><span class="text-btn">Добавить</span></a>\r\n    </li>\r\n\r\n\r\n\r\n    ';

        'if => active';
        'else => not active';
    ;
__p += '\r\n\r\n\r\n\r\n    ';
 if (model_id) { ;
__p += '\r\n        <li class="btn item">\r\n            <a href="#remove/' +
((__t = ( model_id )) == null ? '' : __t) +
'" class="link-bloсk"><i class="fa fa-ban"></i><span class="text-btn">Удалить</span></a>\r\n        </li>\r\n    ';
 } else { ;
__p += '\r\n        <li class="btn item blocked">\r\n            <span class="link-bloсk"><i class="fa fa-ban"></i><span class="text-btn">Удалить</span></span>\r\n        </li>\r\n    ';
 } ;
__p += '\r\n\r\n\r\n    ';
 if (model_id) { ;
__p += '\r\n        <li class="add btn item">\r\n            <a href="#edit/' +
((__t = ( model_id )) == null ? '' : __t) +
'" class="link-bloсk"><i class="fa fa-edit"></i><span class="text-btn">Редактировать</span></a>\r\n        </li>\r\n    ';
 } else { ;
__p += '\r\n        <li class="add btn item blocked">\r\n            <span class="link-bloсk"><i class="fa fa-edit"></i><span class="text-btn">Редактировать</span></span>\r\n        </li>\r\n    ';
 } ;
__p += '\r\n</ul>\r\n';

}
return __p
};