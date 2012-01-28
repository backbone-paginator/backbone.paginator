(function (collections, clientPaginator, model) {
    
    collections.TagsClient = Backbone.Collection.extend({
        model : model,

        url: 'http://odata.netflix.com/v2/Catalog/Titles?' +
            '$top=30&' +
            '$skip=0&' +
            '$orderby=ReleaseYear&' +
            '$inlinecount=allpages&' +
            '$filter=substringof%28%27the%27,%20Name%29%20eq%20true&' +
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
            // Be sure to change this based on how your results
            // are structured
            var tags = response.d.results;
            //this.queryParams.totalPages = response.d.__count;
            return tags;
        }

    });

    _.extend(collections.TagsClient.prototype, clientPaginator);

})(App.collections, App.mixins.clientPaginator, App.models.Tag);


