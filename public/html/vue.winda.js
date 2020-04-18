/*半成品的列表控件*/
(function(Vue, WindService){

	function getScrollEventTarget(element, rootParent) {
		if(!rootParent){rootParent = window}
		let currentNode = element;
		while (currentNode && currentNode.tagName !== 'HTML' && currentNode.tagName !== 'BODY' && currentNode.nodeType === 1 && currentNode !== rootParent) {
			const overflowY = this.getComputedStyle(currentNode).overflowY;
			if (overflowY === 'scroll' || overflowY === 'auto') {
				return currentNode;
			}
			currentNode = currentNode.parentNode;
		}
		return rootParent;
	}

	function isReachEdge(event, direction, offset, placeholder){
		if(offset === undefined){offset=0}


 		var eventTarget = event.target;
		var scrollHeight = eventTarget.scrollHeight;
		var clientHeight = eventTarget.clientHeight;
		var scrollTop = eventTarget.scrollTop;
		var isReachEdge = scrollTop + clientHeight >= scrollHeight;


		// if (direction === 'up') {
		// 	isReachEdge = scrollerRect.top - placeholderRect.top <= offset;
		// } else {
		// 	isReachEdge = placeholderRect.bottom - scrollerRect.bottom <= offset;
		// }
		return isReachEdge;
	}


	function debounce(task, time){
		var timer = null;
		return function(){
			if(timer !== null){
				clearTimeout(timer);
			}
			timer = setTimeout(task.bind(arguments[0], arguments[1]), time);
		}
	}
	function throttle(task, time){
		var valid = true;
		return function(){
			if(valid){
				valid = false;
				task();
				setTimeout(function(){
					valid = true;
				}, time);
			}
		}
	}
	Vue.component("PageableList", {
		props: {
			curPage: String,
			pageName: String,
			useSearch: {
				type: Boolean,
				default: true
			},
			searchKey: {
				type: String,
				default: "search"
			},
			searchPlaceholder: {
				type: String,
				default: "输入进行查询"
			},
			listContainerStyle: {
				type: Object,
			},
			useCustomItem: {
				type: Boolean,
				default: false
			},
			queryInit: {
				type: Object,
				default: function(){
					return {pageNumber: 1, pageSize: 10};
				}
			},
			idKey: {
				type: String,
				default: 'id'
			},
			checkedKey: {
				type: String,
				default: '__checked'
			},
			valueKey: {
				type: String,
				default: 'value'
			},
			allowCancelRadio: {
				type: Boolean,
				default: false
			},
			allowNoneCheck: {
				type: Boolean,
				default: false
			},
			isRadio: {
				type: Boolean,
				default: false
			},
			checkedInit: {
				type: Array,
				default: function(){
					return [];
				}
			},
			itemPreProcess: {
				type: Function,
				default: function(item){
					
				}
			},
			showBtn: {
				type: Boolean,
				default: true
			},
			getData: {
				type: Function,
				default: function(query, callback){
					console.log(query, callback);
				}
			},
			isList: {
				type: Boolean,
				default: false
			},
			listSearchPolicy: {
				type: Function,
				default: null
			},
			hideKey: {
				type: String,
				default: "__hide"
			},
			//是否初始化加载，后续可以通过修改该字段来触发重新加载。
			execLoad: {
				type: Number,
				default: 1
			}
		},
		data: function(){
			return {
				//是否加载中
				$_loading: false,
				searchTimer: '',
				query: {},
				//使用到的数据
				data: [],
				//选择操作，存id就可以了，可以用来判断哪些被移除了，
				checked: [],
				added: []
			}
		},
		created: function(){
			this.resetQuery();
			if(this.execLoad){
				this.reload();
			}
		},
		methods: {
			sync: function(task){
				if(this.$data.$_loading){
					return false;
				}
				this.$data.$_loading = true;
				task.call(this);
			},
			syncEnd: function(){
				if(!this.$data.$_loading){
					console.log("Warn: 非加载状态调用释放方法");
				}
				this.$data.$_loading = false;
			},
			setPageNumber: function(pageNumber){
				this.query.pageNumber = pageNumber;
			},
			resetQuery: function(){
				this.query = $.extend({}, this.queryInit);
			},
			load: function(loadMore){
				var _this = this;
				this.sync(function(){
					_this.onLoad();
					var query = {};
					if(loadMore){
						query.pageNumber = _this.query.pageNumber + 1;
					}
					query = $.extend({}, _this.query, query);
					_this.getData(query, function(data){
						if(data.code === 0){
							var list;
							if(_this.isList){
								list = data.data;
							}else {
								var page = data.data;
								list = page.list;
							}
							if(list && list.length){
								var checkedSet = iUtils.toSet(_this.checked);
								for(var i = 0; i < list.length; i++){
									var item = list[i];
									_this.itemPreProcess(item);
									var id = _this.getItemId(item);
									item[_this.hideKey] = false;
									_this.setItemChecked(item, checkedSet[id]);
									_this.data.push(item);
								}
								_this.setPageNumber(query.pageNumber);
							}
						}
						_this.syncEnd();
						_this.onFinished();
					});
				});
			},
			reload: function(){
				this.resetQuery();
				this.data.splice(0);
				this.load();
			},
			search: function(){
				var _this = this;
				if(_this.isList && _this.listSearchPolicy){
					_this.listSearchPolicy(_this.data, _this.query, _this.hideKey);
				}else {
					_this.searchTimer && clearTimeout(_this.searchTimer);
					_this.searchTimer = setTimeout(function(){
						_this.reload();
					}, 1000);
				}
			},
			onLoad: function(){
				
			},
			onFinished: function(){
				
			},
			getRemoved: function(){
				var checkedSet = iUtils.toSet(this.checked);
				var removed = [];
				for(var i = 0; i < this.checkedInit.length; i++){
					var id = this.checkedInit[i];
					if(!checkedSet[id]){
						removed.push(id);
					}
				}
				return removed;
			},
			cancel: function(){
				this.$emit("cancel");
			},
			confirm: function(){
				if(!this.checked.length && !this.allowNoneCheck){
					return;
				}
				this.$emit("confirm", this.added, this.getRemoved());
			},
			remove: function(index){
				this.data.splice(index, 1);
			},
			getItemId: function(item){
				return item[this.idKey];
			},
			setItemChecked: function(item, checked){
				item[this.checkedKey] = !!checked;
			},
			isItemChecked: function(item){
				return item[this.checkedKey];
			},
			check: function(item){
				this.$emit("itemClick", item);
				var _this = this;
				var id = _this.getItemId(item);
				if(_this.isItemChecked(item)){//已选中，试图取消选中状态
					if(_this.allowCancelRadio || !_this.isRadio){
						_this.setItemChecked(item, false);
						iUtils.remove(_this.checked, id);
						iUtils.removeInSet(_this.added, [id], false, _this.idKey);
					}else {
						//是radio并且不允许取消radio则不做操作
					}
				}else {//未选中，试图选中
					var checkedInitSet = iUtils.toSet(this.checkedInit);
					if(this.isRadio){
						var needRemove = {};
						iUtils.each.call(_this.data, function(e){
							var curItemId = _this.getItemId(e);
							if(_this.isItemChecked(e) && curItemId !== id){
								_this.setItemChecked(e, false);
								needRemove[curItemId] = true;
							}
						});
						iUtils.removeInSet(_this.checked, needRemove, false);
						iUtils.removeInSet(_this.added, needRemove, false, _this.idKey);
					}
					_this.setItemChecked(item, true);
					_this.checked.push(id);
					if(!checkedInitSet[id]){
						_this.added.push(item);
					}
				}
			},
			setSearch: function(search){
				console.log("set Search " + search);
				this.query[this.searchKey] = search;
				this.search();
			},
			onScroll: function(event){
				this.debounceOnScroll(this, event);
			},
			debounceOnScroll: debounce(function(event){
				console.log(this, event);

				var isReach = isReachEdge(event, 'down');
				if (isReach) {
					console.log("reach edge...");
					this.load(true);
				}



			}, 300)
		},
		template:
				'<div v-show="curPage == pageName" :page-name="pageName">'+
				'	<slot name="search" v-bind:setSearch="setSearch">'+
				'		<div class="search" style="position: fixed;">'+
				'			<span class="icon">☌</span><input v-on:input="search()" v-model="query[searchKey]"  v-bind:placeholder="searchPlaceholder">'+
				'		</div>'+
				'	</slot>'+
				
				'	<slot name="list" v-bind:data="data" v-bind:check="check">'+
				'		<div class="" @scroll="onScroll" style="overflow-y: auto; position: fixed; top: 0; right: 0; bottom: 0; left: 0;" :style="listContainerStyle">'+
				'			<ul class="search-li">'+
				'				<li v-for="(item, index) in data" v-bind:class="{checked: item[checkedKey]}" v-on:click="check(item)" v-bind:key="item.id" v-show="!item[hideKey]">'+
				'					<span class="icon"><span></span></span>'+
				'					<div><span v-html="item[valueKey]"></span></div>'+
				'				</li>'+
				'			</ul>'+
				'		</div>'+
				'	</slot>'+

				'	<div class="fixed" v-show="showBtn">'+
				'		<div class="fixed-btn" @click="cancel">取消 </div>'+	
				'		<div class="fixed-btn" @click="confirm">确定</div>'+
				'	</div> '+
				'</div>',
		watch: {
			'$data.$_loading': function(){
				console.log(this.pageName + " is loading: " + this.$data.$_loading);
			},
			'checkedInit': function(arr){
				var i;
				var _this = this;
				var map = {};
				this.checked.splice(0);
				this.added.splice(0);
				for(i = 0; i < arr.length; i++){
					var v = arr[i];
					if(v !== undefined && v != null){
						map[v] = true;
						_this.checked.push(v);
					}
				}
				for(i = 0; i < this.data.length; i++){
					var item = _this.data[i];
					_this.setItemChecked(item, map[_this.getItemId(item)]);
				}
			},
			'execLoad': function(){
				this.reload();
			}
		}
	});
	Vue.component("DemoPicker", {
		props: {
			curPage: String,
			pageName: String
		},
		data: function(){
			return {
				listConfig: {
					pageName: this.pageName || "demoPicker",
					getData: WindService.getFool,
					isList: true,
					valueKey: "name",
					queryInit: {pageNumber: 1, pageSize: 50},
					listContainerStyle: {top: "60px", bottom: "60px"},
				}
			}
		},
		template:
			'<pageable-list v-bind="listConfig" :cur-page="curPage">' +
			'</pageable-list>'
	})
})(Vue, WindService);