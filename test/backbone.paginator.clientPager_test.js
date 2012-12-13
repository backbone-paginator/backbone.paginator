/*globals Backbone:false, _:false, jQuery:false, $: false,
      describe: true, expect: true, sinon: true
      it: true, beforeEach: true, afterEach: true*/

var fakeAjax = function(func){
  var xhr = sinon.useFakeXMLHttpRequest(), requests = [];
  xhr.onCreate = function(xhr){
    requests.push(xhr);
  };
  try{
    func(requests);
  }
  catch(e){
    throw(e);
  }
  finally{
    xhr.restore();
  }
};

describe('backbone.paginator.clientPager',function(){
  var OPTS = {
    model: Backbone.Model,
    paginator_ui: {
      firstPage: 1,
      currentPage: 1,
      perPage: 3,
      totalPages: 10,
      pagesInRange: 4
    },
    paginator_core: {
      url: 'http://odata.netflix.com/v2/Catalog/Titles',
      dataType: 'json'
    },
    parse: function (response) {
      return response;
    }
  }, getModels = function(){
    return _.map(_.range(30), function(i){
      return {name: "Johnny Cash", id: i};
    });
  }, PagedCollection = Backbone.Paginator.clientPager.extend(OPTS);

  it("should instantiate without error", function(){
    new PagedCollection();
  });

  it("should send request to the server", function(){
    fakeAjax(function(requests){
      expect(requests.length).to.equal(0);
      var coll = new PagedCollection();
      coll.fetch();
      expect(requests.length).to.equal(1);
      expect(requests[0].url.split("?")[0]).to.equal(OPTS.paginator_core.url);
    });
  });

  it("should calculate size correctly", function(){
    fakeAjax(function(requests){
      var coll = new PagedCollection();
      coll.fetch();
      requests[0].respond(200, {}, JSON.stringify(getModels()));
      expect(coll.size()).to.equal(30);
    });
  });

  it("should jump to correct page", function(){
    fakeAjax(function(requests){
      var coll = new PagedCollection();
      coll.fetch();
      requests[0].respond(200, {}, JSON.stringify(getModels()));
      coll.goTo(3);
      var page = coll.toJSON();
      expect(page.length).to.equal(3);
      expect(page[0].id).to.equal(6);
      expect(page[2].id).to.equal(8);
    });
  });

});
