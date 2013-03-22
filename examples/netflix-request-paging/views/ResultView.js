( function ( views ){

  views.ResultView = Backbone.View.extend({
    tagName : 'li',
    template: _.template($('#resultItemTemplate').html()),

    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('remove', this.remove, this);
    },

    render : function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

})( app.views );
