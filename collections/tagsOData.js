(function (collections, pagination, model) {
    collections.Tags = Backbone.Collection.extend({
        model : model,

        /*  Using only &callback=? produces an error messages "invalid label".
            Using sync in addition to set required Ajax params */

        url : 'http://odata.netflix.com/v2/Catalog/Titles?' +
            '$top=30&' +
            '$skip=0&' +
            '$orderby=ReleaseYear&' +
            '$inlinecount=allpages&' +
            '$filter=substringof%28%27Batman%27,%20Name%29%20eq%20true&' +
            '$format=json&' +
            '$callback=callback',

        sync : function (method, model, options) {
            var params = _.extend({
                type : 'GET',
                dataType : 'jsonp',
                jsonpCallback : 'callback',
                url : this.url,
                processData : false
            }, options);

            return $.ajax(params);
        },

        parse : function (response) {
            var tags = response.d.results;

            /*
             uncomment if you wish to return the total
             number of available results that are available


             */
            this.queryTotalPages = response.d.__count;

            return tags;
        }

    });

    _.extend(collections.Tags.prototype, pagination);
})(App.collections, App.mixins.Paginator, App.models.Tag);

