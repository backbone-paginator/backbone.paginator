(function (collections,clientPaginator, serverPaginator, model) {
    collections.Tags = Backbone.Collection.extend({
        model : model,

        url: 'http://odata.netflix.com/v2/Catalog/Titles?&',

        sync : function (method, model, options) {

            var params = _.extend({
                type : 'GET',
                dataType : 'jsonp',
                jsonpCallback : 'callback',
                data: decodeURIComponent($.param(serverPaginator.queryMap)),
                url : this.url,
                processData : false
            }, options);

            return $.ajax(params);
        },

        parse : function (response) {
            // Be sure to change this based on how your results
            // are structured
            var tags = response.d.results;
            this.queryParams.totalPages = response.d.__count;
            return tags;
        }

    });

    _.extend(collections.Tags.prototype, clientPaginator);
    _.extend(collections.Tags.prototype, serverPaginator);

})(App.collections, App.mixins.clientPaginator, App.mixins.serverPaginator, App.models.Tag);

