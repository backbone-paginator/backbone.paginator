(function ( collections, mixins, model ) {
    
    collections.TagsServer = Backbone.Collection.extend({
        model : model,


        url: 'http://odata.netflix.com/v2/Catalog/Titles?&',

        sync : function ( method, model, options ) {

            
            // A map (queryMap) object contains name mappings for parameters you'll be passing back
            // to the server. In the case of this example, we're using NetFlix OData
            // which uses $top, $skip etc. to define what paginated data should be
            // returned from their service. If you had your own data service of the form
            // http://domain.com/api/?query=houses&page=2&sortBy=year, your queryMap
            // would just contain
            // query: mixins.Paginator.query
            // page: mixins.Paginator.page
            // sortBy: mixins.Paginator.sortField

            // The map can contain not just direct references
            // to values in the queryParams object but can also contain mutated values
            // such as $skip, which is composed by multipying the current page by the 
            // number of items per page. You can also choose to mix values from the 
            // queryParams object with custom string information (see $filter) so this
            // is fairly flexible.

            var queryMap = {
                $top: mixins.serverPaginator.queryParams.perPage,
                $skip: mixins.serverPaginator.queryParams.page * mixins.serverPaginator.queryParams.perPage,
                orderBy: mixins.serverPaginator.queryParams.sortField,
                $inlinecount: mixins.serverPaginator.queryParams.customParam1,
                $filter: "substringof%28%27" + mixins.serverPaginator.queryParams.query + "%27,%20Name%29%20eq%20true",
                $format: mixins.serverPaginator.queryParams.format,
                $callback: mixins.serverPaginator.queryParams.customParam2
            };

            var params = _.extend({
                type : 'GET',
                dataType : 'jsonp',
                jsonpCallback : 'callback',
                data: decodeURIComponent($.param(queryMap)),
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

    _.extend( collections.TagsServer.prototype, mixins.serverPaginator );


})( App.collections, App.mixins, App.models.Tag );


