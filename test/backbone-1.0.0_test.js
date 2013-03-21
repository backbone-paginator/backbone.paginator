// this file contains tests which target behaviour found in backbone 1.0.0

it('should use "promise-style" `options.success` arguments', function(done){

  // 0.9.10 had changed the arguments but 1.0.0 reverted back to what it used to be
  // in 0.9.9 and earlier

  var requestPagerTest = {
    paginator_ui: {},
    paginator_core: {
      type: 'GET',
      dataType: 'json'
    }
  };
  _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

  var server = sinon.fakeServer.create();
  server.autoRespond = true;
  server.respondWith([200, { "Content-Type": "application/json" }, '{ "key": "value" }']);

  var model = {};

  var options = {
    success: function(model_, resp_, options) {
      var status_ = resp_;
      resp_ = model_;
      var xhr_ = options;
      expect(resp_['key']).to.equal('value');
      expect(status_).to.equal('success');
      expect(xhr_).to.have.property('status', 200);
      done();
    }
  };

  // execute
  requestPagerTest.sync(null, model, options);

  server.restore();
});


