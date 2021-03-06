$(function(){
    window.NAMESPACE = window.NAMESPACE ? window.NAMESPACE : window.NAMESPACE = {};

    // создаем объекты приложения с записью в пространство имен
    var App = window.NAMESPACE.App = {};
    var socket = window.NAMESPACE.socket = io();
    var storage = window.NAMESPACE.storage = new ObjectStorage();

    // модель записи
    var RecordModel = Backbone.Model.extend({

        idAttribute: "_id",

        defaults: {
            "title": "",
            "body": "",
            "date": ""
        },

        remove: function () {
            this.destroy(); // delete model on server
            return this;
        },

        validate: function (attr) {
            var message = 'Все поля обязательны для заполнения';
            if (!attr.title.length) return message;
            if (!attr.body.length) return message;
        }

    });

    // представление одной записи
    var RecordView = Backbone.View.extend({

        tagName: 'li',

        className: 'record-item',

        template: JST['record-item.html'],

        events: {
            "click .remove": "remove"
        },

        initialize: function (model) {
            this.model = model;
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.render);
            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();
            var id = this.model.id;
            var opt = $.extend({'id': id}, attr); // render data
            this.$el.html( this.template( opt ) );
            return this;
        },

         // удаляем запись на сервере и из DOM
         // отписываемся от всех событий для удаления объекта из памяти
        remove: function () {
            this.off();
            this.stopListening();
            this.model.remove();
            this.$el.remove();
            return this;
        }

    });


    // коллекция записей
    var RecordsCollection = Backbone.Collection.extend({

        url: '/recordings',

        model: RecordModel,

        parse: function (res) {
            return _.toArray(res);
        },

        comparator: function (a, b) {
            return a.attributes.date < b.attributes.date; // сортируем от новых к старым
        },

        initialize: function () {
            this.on('remove', this.remove);
            this.on('sync', this.seveLocal);

            // обновляем состояние коллекции
            this.fetch({reset: true});
        },

        seveLocal: function () {
            // save models in localStorage for fast load application
            storage.local.records = this.toJSON();
        }

    });

    /* представление коллекции записей */
    var RecordsListView = Backbone.View.extend({

        tagName: 'ul',

        initialize: function (collection) {
            this.collection = collection;

            // при изменении коллекции перерисовываем представление
            this.listenTo(this.collection, 'sync', this.render);
        },

        render: function () {
            this.$el.empty();

            /* добовляем записи в список */
            _.each(this.collection.models, function (item) {
                var record = new RecordView(item);
                this.$el.append( record.$el );
            }, this);

            return this;
        }

    });

    /* экземпляр модели для создания новой записи  (наследуется от экземпляр модели) */
    var CreateRecordModel = RecordModel.extend({

        initialize: function (attr, collection) {
            this.collection = collection;
        },

        create: function () {
            var callback = function (model, res) {
            /*  после успешного сохранения модели на сервере,
                добовляем модель в коллекция и переходим к
                списку записей  */
                model.collection.add(model);
                App.router.navigate('#records', {trigger: true})
            };

            /* save model on server */
            this.save({}, {success: callback});
        }

    });

    // представление создания/изменения записи
    var WriteRecordView = Backbone.View.extend({

        className: 'record-once',

        template: JST['record-new.html'],

        events: {
            "keyup .title-record": "setTitle",
            "keyup .body-record": "setBody",
            "click .send": "send"
        },

        initialize: function (model) {
            this.model = model;
        },

        render: function () {
            this.$el.append( this.template( this.model.toJSON() ) );
            return this;
        },

        setTitle: function (e) {
            this.model.set('title', e.currentTarget.value);
        },

        setBody: function (e) {
            this.model.set('body', e.currentTarget.value);
        },

        send: function () {
            // if => новая запись
            // else => изменения записи
            if (this.model instanceof CreateRecordModel) {
                this.model.create();
            } else {
                this.model.save();
                App.router.navigate('#records', {trigger: true});
            }
        }

    });

    // представление открытой записи
    var RecordOpenOneView = Backbone.View.extend({

        className: 'record-once',

        template: JST['record-once.html'],

        initialize: function (model) {
            this.model = model;
            this.listenTo(this.model, 'change', this.render);
        },

        render: function () {
            this.$el.empty().append( this.template( this.model.toJSON() ) );
            return this;
        }

    });

    // модель бокового меню
    var SidebarModel = Backbone.Model.extend({

        defaults: {
            'model_id': ''
        },

        initialize: function () {
            Backbone.on('sidebar:change', this.setState, this);
        },

        /* состояние в котором должен находится sidebar
        (какие кнопки доступны, а какие заблокированы) */
        setState: function (opt) {
            this.resetState();
            if (!opt) return this;
            this.set(opt);
            return this;
        },

        // начальное состояние ("удалить" и "изменить" заблокированы)
        resetState: function () {
            this.set(this.defaults);
            return this;
        }

    });

    // представление бокового меню
    var SidebarView = Backbone.View.extend({

        template: JST['sidebar.html'],

        el: "#sidebar",

        initialize: function(model) {
            this.model = model;
            this.render();

            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        }


    });

    var Router = Backbone.Router.extend({

        initialize: function () {
            var self = this;
            /* при роутинге, если есть поддержка html 5 history,
            заменяем "#" на "/" и получаем оригинальный url */
            $(window).on('hashchange', function(e){
                var new_fragment = window.location.hash.replace('#', '');
                var current_fragment = Backbone.history.fragment;

                if (current_fragment === new_fragment) return;
                self.navigate(new_fragment, {trigger: true});
            })
        },

        routes: {
            "records(/)": "showRecords",
            "records/:record_num(/)": "openRecord",
            "edit/:record_num(/)": "editRecord",
            "remove/:record_num(/)": "removeRecord",
            "write(/)": "createRecord",
            '(*path)': 'redirect'
        },

        // если урл не извесный, редиректим на список записей
        redirect: function () {
            this.navigate('#records', {trigger: true});
        },

        // список всех записей
        showRecords: function () {
            $('#content').empty().append( App.recordsListView.render().$el );

            // меняем набор активных кнопок
            Backbone.trigger('sidebar:change');
        },

        // открыть запись
        openRecord: function (record_num) {
            var model = App.recordsCollection.get(record_num);
            $('#content').empty().append( new RecordOpenOneView(model).render().$el );

            // меняем набор активных кнопок
            Backbone.trigger('sidebar:change', {model_id: model.id});
        },

        editRecord: function (record_num) {
            var model = App.recordsCollection.get(record_num);
            $('#content').empty().append( new WriteRecordView(model).render().$el );

            // меняем набор активных кнопок
            Backbone.trigger('sidebar:change');
        },

        // удаляем запись и редиректим на список всех записей
        removeRecord: function (record_num) {
            var model = App.recordsCollection.get(record_num);
            if (model) model.remove();
            this.navigate('#records', {trigger: true});
        },

        createRecord: function () {
            var model = new CreateRecordModel({}, App.recordsCollection);
            $('#content').empty().append( new WriteRecordView(model).render().$el );

            // меняем набор активных кнопок
            Backbone.trigger('sidebar:change', {model_id: model.id});
        }

    });



    // init application

    var histAPI=!!(window.history && history.pushState);

    // получаем список записей, для инициализации приложения
    // (список записей на момент закрытия приложения)
    storage.local.records = storage.local.records || [];

    App.sidebarModel = new SidebarModel();
    App.sidebarView = new SidebarView( App.sidebarModel );
    App.recordsCollection = new RecordsCollection( storage.local.records );
    App.recordsListView = new RecordsListView( App.recordsCollection );
    App.router = new Router();

    if (histAPI) {
        // поддержка оригинальных url
        Backbone.history.start({pushState: true, root: '/app'});
    } else {
        Backbone.history.start();
    }


    // синхронизация приложения в online
    socket.on('create', function (data) {
        App.recordsCollection.add(data.response, {merge: true});
        App.recordsCollection.trigger('sync');
    });
    socket.on('update', function (data) {
        App.recordsCollection.add(data.response, {merge: true});
        App.recordsCollection.trigger('sync');
    });
    socket.on('delete', function (data) {
        App.recordsCollection.get(data.response._id).remove();
        App.recordsCollection.trigger('sync');
    });


});
