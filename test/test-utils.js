/*globals Backbone:false, _:false, jQuery:false, $: false,
      describe: true, expect: true, sinon: true,
      it: true, beforeEach: true, afterEach: true */

// helper for easy ajax faking
var fakeAjax = function(func){
  var xhr = sinon.useFakeXMLHttpRequest();
  var requests = [];
  xhr.onCreate = function(xhr){
    requests.push(xhr);
  };
  try{
    func(requests);
  }
  catch (e){
    throw e;
  }
  finally{
    xhr.restore();
  }
};

// make a standard pager
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
