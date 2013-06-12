/*globals Backbone:false, _:false, jQuery:false, $: false,
      describe: true, xdescribe: true, expect: true, sinon: true,
      it: true, xit: true, beforeEach: true, afterEach: true, fakeAjax: true */

// this file contains tests which target behaviour found in backbone 1.0.0

var makePager = function(){
  var pager = {
    paginator_ui: {},
    paginator_core: {
      type: 'GET',
      dataType: 'json',
      url: 'http://odata.netflix.com/Catalog/People(49446)/TitlesActedIn?'
    }
  };
  _.extend(pager, new Backbone.Paginator.requestPager());
  return pager;
};

/* 0.9.10 had changed the arguments but 1.0.0 reverted back to what it used to be
   in 0.9.9 and earlier */
describe("Backbone 1.0.0 specific functionality", function() {

  it("should use 'promise-style' `options.success` arguments for sync", function(done){

    var requestPagerTest = makePager();
    var options = {
      success: function(response, status, xhr) {
        expect(response['key']).to.equal('value');
        expect(status).to.equal('success');
        expect(xhr).to.have.property('status', 200);
        done();
      }
    };

    fakeAjax(function(requests){
      requestPagerTest.sync(null, {}, options);
      expect(requests.length).to.equal(1);
      requests[0].respond(200, {"Content-Type": "application/json"},'{ "key": "value" }');
    });


  });

  it("should use 'promise-style' `options.success` arguments for fetch", function(done){

    var requestPagerTest = makePager();
    var options = {
      success: function(model, response, options) {
        expect(model.toJSON()[0].key).to.equal("value");
        expect(response['key']).to.equal('value');
        done();
      }
    };

    fakeAjax(function(requests){
      requestPagerTest.fetch(options);
      expect(requests.length).to.equal(1);
      requests[0].respond(200, {"Content-Type": "application/json"},'{ "key": "value" }');
    });


  });

  it('should use "promise-style" `options.error` arguments', function(done){

    var requestPagerTest = makePager();
    var options = {
      error: function(model, xhr, options) {
        expect(model.toJSON().length).to.equal(0);
        expect(xhr).to.have.property("status", 401);
        expect(options).to.have.property("data", "");
        done();
      }
    };

    fakeAjax(function(requests){
      requestPagerTest.fetch(options);
      expect(requests.length).to.equal(1);
      requests[0].respond(401, {"Content-Type": "application/json"}, "{}");
    });
  });
});

