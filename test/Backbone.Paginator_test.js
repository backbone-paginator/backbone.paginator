/*global require:true */
var Backbone_Paginator = require('../lib/Backbone.Paginator.js');

exports['awesome'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no args': function(test) {
    test.expect(1);
    // tests here
    test.equal(Backbone_Paginator.awesome(), 'awesome', 'should be awesome.');
    test.done();
  }
};
