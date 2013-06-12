/*globals Backbone:false, _:false, jQuery:false, $: false,
      describe: true, xdescribe: true, expect: true, sinon: true,
      it: true, xit: true, beforeEach: true, afterEach: true*/

// this file contains tests which target behaviour found in backbone 1.0.0

var makePager = function(){
  var pager = {
    paginator_ui: {},
    paginator_core: {
      type: 'GET',
      dataType: 'json'
    }
  };
  _.extend(pager, new Backbone.Paginator.requestPager());
  return pager;
};

describe("Backbone 1.0.0 specific functionality", function() {
  it('should use "promise-style" `options.success` arguments', function(done){

    // 0.9.10 had changed the arguments but 1.0.0 reverted back to what it used to be
    // in 0.9.9 and earlier

    var requestPagerTest = makePager();

    var server = sinon.fakeServer.create();
    server.autoRespond = true;
    server.respondWith([200, { "Content-Type": "application/json" }, '{ "key": "value" }']);

    var options = {
      success: function(response, status, xhr) {
        expect(response['key']).to.equal('value');
        expect(status).to.equal('success');
        expect(xhr).to.have.property('status', 200);
        done();
      }
    };

    // execute
    requestPagerTest.sync(null, {}, options);

    server.restore();
  });

  it('should use "promise-style" `options.error` arguments', function(done){

    // 0.9.10 had changed the arguments but 1.0.0 reverted back to what it used to be
    // in 0.9.9 and earlier

    var requestPagerTest = makePager();

    var server = sinon.fakeServer.create();
    server.autoRespond = true;
    server.respondWith([401, { "Content-Type": "application/json" }, '{ "key": "value" }']);

    var options = {
      error: function(model, xhr, options) {
        expect(xhr).to.have.property('status', 401);
        done();
      }
    };

    // execute
    requestPagerTest.sync(null, {}, options);

    server.restore();
  });
});

