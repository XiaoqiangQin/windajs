var __WindParams = {};
var __WindPages = {};

var WindService = {
		getRequestParam: function(key){
			var value = __WindParams[key];
			return value || "";
		},
		getRequestToken: function(){
			return this.getRequestParam("token");
		},
		$_get: function(url, query, callback){
			var _this = this;
			$.get(url, query, callback);
		},
		getFool2: function(query, callback){
			WindService.$_get('getFool', query, callback);
		},
		getFool: (function(){
			function mock(query, callback){
				console.log("Mock...");
				var data = [];
				if(query.pageNumber < 3){
					for(var count = 0; count < query.pageSize; count++){
						var id = 1 + count + (query.pageNumber - 1) * query.pageSize;
						data.push({id: id, name: "项目" + id, sn: "SN_0000" + id});
					}
				}
				callback({code: 0, data: data});
			}
			return function(query, callback){
				setTimeout(mock.bind(undefined, query, callback), 200);
			}
		})()
};
var WindRoute = {
		__goTo: function(url){
			window.location.href = url;
		},
		setHash: function(hash){
			if(hash.indexOf("#") >= 0){
				return;
			}
			history.pushState(null, null, "#" + hash);
		}
};
__WindPages.allocationDetail = "allocation/orderDetail.html";

(function(WindService, WindRoute){
	var goTo = function(page, params, pageName, config){
		config = $.extend({noToken: false}, config);
		params = $.extend({}, params);
		var url = "/page/phone/html/" + page;
		var search = "";
		if(!config.noToken){
			params.token = WindService.getRequestToken();
		}
		for(var key in params){
			var value = params[key];
			if(search){
				search += "&";
			}
			search += key + "=" + value;
		}
		if(search){
			url += "?" + search;
		}
		WindRoute.__goTo(url);
	};
	for(var pageName in __WindPages){
		var page = __WindPages[pageName];
		(function(pageName, page){
			WindRoute[pageName] = function(params, config){
				goTo.call(WindRoute, page, params, pageName, config);
			}
		})(pageName, page);
	}
})(WindService, WindRoute);
(function(){
	var searches = window.location.search.substr(1);
	if(searches){
		var arr = searches.split("&");
		for(var i = 0; i < arr.length; i++){
			var str = arr[i];
			if(str){
				var pair = str.split("=");
				var k = pair[0];
				var v = pair[1] || "";
				if(k){
					__WindParams[k] = v;
				}
			}
		}
	}
})();
