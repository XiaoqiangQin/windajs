/*半成品的列表控件*/
(function(Vue, WindService, IosSelect){
	var FastIosSelect = window.__FastIosSelect = {};
	/**
	 * 时间相关的操作
	 * @type {{fixZero: fixZero, Month: (function(*, *): []), Year: (function(*): []), Minute: (function(): []), Second: (function(): []), Hour: (function(): []), now: (function(*=): string), isLeapYear: isLeapYear, Date: (function(): [])}}
	 */
	var dateGen = {
		isLeapYear: function (year) {
			if(year%400 === 0 || (year%4 === 0 && year%100 !== 0) ) {
				return true;
			}
			else { return false; }
		},
		Year: function (callback) {
			var endYear = new Date().getFullYear() + 50;
			var arr = [];
			for (var i = 1996; i <= endYear; i++) {
				arr.push({
					id: i + '',
					value: i + '年'
				});
			}
			if(callback instanceof Function){
				callback(arr);
			}
			return arr;
		},
		Month: function (year, callback) {
			var arr = [];
			for (var i = 1; i <= 12; i++) {
				arr.push({
					id: i + '',
					value: i + '月'
				});
			}
			if(callback instanceof Function){
				callback(arr);
			}
			return arr;
		},
		Date: function () {
			var year = arguments[0], month = arguments[1], callback = arguments[2];
			var monthDay = 30;
			switch(parseInt(month)) {
				case 1: monthDay = 31; break;
				case 2:
					if(this.isLeapYear(year)) { monthDay = 29; }
					else { monthDay = 28; }
					break;
				case 3: monthDay = 31; break;
				case 4: monthDay = 30; break;
				case 5: monthDay = 31; break;
				case 6: monthDay = 30; break;
				case 7: monthDay = 31; break;
				case 8: monthDay = 31; break;
				case 9: monthDay = 30; break;
				case 10: monthDay = 31; break;
				case 11: monthDay = 30; break;
				case 12: monthDay = 31; break;
			}
			var arr = [];
			for (var i = 1; i <= monthDay; i++) {
				arr.push({
					id: i + '',
					value: i + '日'
				});
			}
			if(callback instanceof Function){
				callback(arr);
			}
			return arr;
		},
		Hour: function () {
			var callback = arguments[arguments.length - 1];
			var arr = [];
			for (var i = 0; i < 24; i++) {
				arr.push({
					id: i + '',
					value: i + '点'
				});
			}
			if(callback instanceof Function){
				callback(arr);
			}
			return arr;
		},
		Minute: function () {
			var callback = arguments[arguments.length - 1];
			var arr = [];
			for (var i = 0; i <= 59; i++) {
				arr.push({
					id: i + '',
					value: i + '分'
				});
			}
			if(callback instanceof Function){
				callback(arr);
			}
			return arr;
		},
		Second: function () {
			var callback = arguments[arguments.length - 1];
			var arr = [];
			for (var i = 0; i <= 59; i++) {
				arr.push({
					id: i + '',
					value: i + '秒'
				});
			}
			if(callback instanceof Function){
				callback(arr);
			}
			return arr;
		},
		fixZero: function(callbackValue, len){
			var id = callbackValue;
			if(typeof callbackValue === "object"){
				id = callbackValue && callbackValue.id;
			}
			if(id === undefined || id === null){
				return null;
			}
			id = "" + id;
			len -= id.length;
			for(; len > 0; len--){
				id = "0" + id;
			}
			return id;
		},
		/**
		 * 获取当前时间
		 * @param isTime true:只返回时间部分，false：只返回日期部分，不传则返回全部
		 * @returns {string} 格式：YYYY-MM-DD HH:mm:ss
		 */
		now: function(isTime){
			var type;
			if(typeof isTime === "string"){
				type = isTime;
			}else {
				if(isTime === true){
					type = "time";
				}else if(isTime === false){
					type = "date";
				}else{
					type = "datetime";
				}
			}
			var now = new Date();
			var ymd = [now.getFullYear(), this.fixZero(now.getMonth() + 1, 2), this.fixZero(now.getDate(), 2)];
			var hms = [this.fixZero(now.getHours(), 2), this.fixZero(now.getMinutes() + 1, 2), this.fixZero(now.getSeconds(), 2)];
			var value = "";
			if(type === "date" || type === "datetime"){
				value += ymd.join("-");
			}
			if(type === "datetime"){
				value += " ";
			}
			if(type === "time" || type === "datetime"){
				value += hms.join(":");
			}
			return value;
		}
	}

	if(IosSelect){
		var levelNames = ["one", "two", "three", "four", "five", "six"];
		/**
		 * 选择时间
		 * @param defaultValue, 初始化的值，格式：YYYY-MM-dd HH:mm:ss，默认为当前时间
		 * @param callback
		 * @param cancelCallback 取消（取消按钮或点击确定）
		 */
		FastIosSelect.date = function(defaultValue, callback, cancelCallback){
			if(!defaultValue){
				defaultValue = "1996-10-08";
			}
			var isTime = defaultValue.indexOf("-") < 0;
			var selectedSlices = defaultValue.replace(/[-|:|\s]/g, "/").split("/");
			var data = [dateGen.Year, dateGen.Month, dateGen.Date.bind(dateGen), dateGen.Hour, dateGen.Minute, dateGen.Second];
			if(isTime){
				data.splice(0, 3);
			}
			var level = selectedSlices.length;
			data.length = selectedSlices.length;
			var options = {
				title: "选择",
				itemHeight: 35,
				showLoading: true,
				fallback: cancelCallback,
				maskCallback: cancelCallback,
				callback: function(v1, v2, v3, v4, v5, v6){
					var v = "";
					var base = [v1, v2, v3];
					base.splice(level);
					if(isTime){
						for(var i = 0; i < base.length; i++){
							base[i] = dateGen.fixZero(base[i], 2);
						}
						v = base.join(":");
					}else {
						base[0] = dateGen.fixZero(base[0], 4);
						base[1] = dateGen.fixZero(base[1], 2);
						base[2] = dateGen.fixZero(base[2], 2);
						v = base.join("-");
						if(level > 3){
							var hms = [v4, v5, v6];
							hms.splice(level - 3);
							for(var i = 0; i < hms.length; i++){
								hms[i] = dateGen.fixZero(hms[i], 2);
							}
							v += " " + hms.join(":");
						}
					}
					// console.log(v);
					callback(v);
				}
			};
			for(var i = 0; i < level; i++){
				var levelName = levelNames[i];
				options[levelName + "LevelId"] = parseInt(selectedSlices[i]);
			}
			return new IosSelect(level, data, options);
		}
	}

	/**
	 * 根据元素获取eventTarget
	 * @param element
	 * @param rootParent
	 * @returns {parentNode|(() => (Node | null))|ActiveX.IXMLDOMNode|(Node & ParentNode)|Window}
	 */
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

	/**
	 * 是否到达顶部/底部
	 * @param event dom事件
	 * @param direction
	 * @param offset
	 * @param placeholder
	 * @returns {boolean}
	 */
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


	/**
	 * 防抖动
	 * @param task 真实执行的函数
	 * @param time 推迟时间，task在该时间内再次触发则会再顺延一个time的时长
	 * @returns {function(...[*]=)}
	 */
	function debounce(task, time){
		var timer = null;
		return function(){
			if(timer !== null){
				clearTimeout(timer);
			}
			timer = setTimeout(task.bind(arguments[0], arguments[1]), time);
		}
	}

	/**
	 * 节流
	 * @param task 真实执行的函数
	 * @param time 任务执行间隔，任务间隔中的任务将不执行
	 * @returns {function(...[*]=)}
	 */
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

	/**
	 * 多层级获取值 obj['l1.l2.l3'] = obj.l1.l2.l3
	 * @param path
	 * @returns {getByPath}
	 */
	function getByPath(path){
		var  dir = path.split(".");
		var v = this;
		for(var i = 0; i < dir.length; i++){
			var key = dir[i];
			v = v[key];
		}
		return v;
	}

	/**
	 * 多层级设置值 obj['l1.l2.l3'] = obj.l1.l2.l3
	 * @param path
	 * @param value
	 * @returns {*}
	 */
	function setByPath(path, value){
		var obj = this;
		var  dir = path.split(".");
		for(var i = 0; i < dir.length - 1; i++){
			var key = dir[i];
			obj = obj[key];
		}
		var directKey = dir[dir.length - 1];
		return obj[directKey] = value;
	}

	/**
	 * 获取当前页面不带井号的hash值
	 * @param defaultHash 如果结果为空将用这个参数代替返回值
	 * @returns {string}
	 */
	function getCurHash(defaultHash){
		var curHash = location.hash;
		if(!curHash || "#" === curHash){
			return defaultHash;
		}
		return curHash.substr(1);
	}

	/**
	 * 是否存在指定元素，应用于对象上时指key
	 * @param key
	 * @returns {boolean}
	 */
	function contains(key){
		if(this instanceof Array){
			for(var i = 0; i < this.length; i++){
				var v = this[i];
				if(key === v){
					return true;
				}
			}
			return false;
		}else if(this instanceof Object){
			return key in this;
		}
	}

	/**
	 * 获取元素所在索引，如果不存在，则返回-1
	 * @param key
	 * @returns {number}
	 */
	function indexOf(key){
		if(this instanceof Array){
			for(var i = 0; i < this.length; i++){
				var v = this[i];
				if(key === v){
					return i;
				}
			}
			return -1;
		}
	}

	/**
	 * 子页面，传入curPage和pageName后自动判断是否显示该页面
	 */
	Vue.component("SubPage", {
		props: {
			curPage: String,
			pageName: String,
		},
		template:
			'<div v-show="curPage == pageName" :page-name="pageName">' +
			'	<slot></slot>' +
			'</div>'
	});
	var Mixin = {
		methods: {
			throwConfirm: function(arg1, arg2, arg3, arg4){
				this.$emit("confirm", arg1, arg2, arg3, arg4);
			},
			throwCancel: function(){
				this.$emit("cancel");
			}
		}
	}
	/**
	 * 通用列表页
	 */
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
			},
			ulClass: {
				type: Object,
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
				var query = {};
				query[this.searchKey] = this.query[this.searchKey] || "";
				this.query = $.extend(query, this.queryInit);
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
				// console.log(this, event);

				var isReach = isReachEdge(event, 'down');
				if (isReach) {
					console.log("reach edge...");
					this.load(true);
				}



			}, 300)
		},
		template:
				'<sub-page :cur-page="curPage" :page-name="pageName">'+
				'	<slot name="search" v-bind:setSearch="setSearch">'+
				'		<div class="search" style="position: fixed;">'+
				'			<span class="icon">☌</span><input v-on:input="search()" v-model="query[searchKey]"  v-bind:placeholder="searchPlaceholder">'+
				'		</div>'+
				'	</slot>'+
				
				'	<slot name="list" v-bind:data="data" v-bind:check="check">'+
				'		<div class="" @scroll="onScroll" style="overflow-y: auto; position: absolute; top: 0; right: 0; bottom: 0; left: 0;" :style="listContainerStyle">'+
				'			<ul class="search-li" v-bind:class="ulClass">'+
				'				<li v-for="(item, index) in data" v-bind:class="{checked: item[checkedKey]}" v-on:click="check(item)" v-bind:key="item.id" v-show="!item[hideKey]">'+
				'					<slot name="item-content-wrapper" v-bind:item="item" v-bind:valueKey="valueKey">'+
				'						<div class="li-content-wrapper">'+
				'							<span class="icon"><span></span></span>'+
				'							<div class="li-content"><span v-html="item[valueKey]"></span></div>'+
				'						</div>'+
				'					</slot>'+
				'				</li>'+
				'			</ul>'+
				'		</div>'+
				'	</slot>'+

				'	<div class="fixed" v-show="showBtn">'+
				'		<div class="fixed-btn" @click="cancel">取消 </div>'+	
				'		<div class="fixed-btn" @click="confirm">确定</div>'+
				'	</div> '+
				'</sub-page>',
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
	/**
	 * 树形选择器
	 */
	// Vue.component("TreePicker", {
	// 	props: {
	//
	// 		valueKey: {
	// 			type: String,
	// 			default: 'value'
	// 		},
	// 	},
	// 	data: function(){
	// 		return {};
	// 	},
	// 	template:
	// 		'<div>' +
	// 		'	<ul class="search-li" v-for="(li, index) in list">'+
	// 		'		<li v-bind:class="{\'checked\': li.checked}" v-on:click="check(li)">'+
	// 		'			<div>'+
	// 		'				<span class="icon"><span></span></span>'+
	// 		'				<div class="border-bottom"><span v-html="li[valueKey]"></span></div>'+
	// 		'			</div>'+
	// 		'			<div v-if="li.children && li.children.length" style="padding-left: 24px;">'+
	// 		'				<tree-picker v-bind:config.showSearch="false" v-bind:config="config" v-bind:list="listData" v-bind:tree="u.children"></tree-picker>'+
	// 		'			</div>'+
	// 		'		</li>'+
	// 		'	</ul>'+
	// 		'</div>',
	// });
	/**
	 * @PageableList 拓展示例，实际使用过程中进行拓展应该新开一个文件，不然不好维护
	 */
	Vue.component("DemoPicker", {
		mixins: [Mixin],
		props: {
			curPage: String,
			pageName: String,
			searchPlaceholder: {
				type: String,
				default: "输入名称/编号进行查询",
			},
			base: {
				type: Number,
			}
		},
		data: function(){
			return {
				search: '',
				justDeviceRelated: false,
				listConfig: {
					pageName: this.pageName || "demoPicker",
					getData: WindService.getFool,
					isList: true,
					valueKey: "name",
					queryInit: {pageNumber: 1, pageSize: 50},
					listContainerStyle: {top: (60 + 40) + "px", bottom: "60px"},
					ulClass: {'search-li-dl': true},
					execLoad: 1,
				}
			}
		},
		methods: {
			onlyShowRelation: function(){
				console.log("onlyShowRelation");
				if(this.justDeviceRelated){
					this.listConfig.queryInit.base = this.base;
				}else {
					this.listConfig.queryInit.base = void(0);
				}
				this.listConfig.execLoad++;
			}
		},
		template:
			'<pageable-list v-bind="listConfig" :cur-page="curPage" @cancel="throwCancel" @confirm="throwConfirm">' +
			'	<template v-slot:search="props">' +
			'		<div class="search" style="position: fixed;">'+
			'			<span class="icon">☌</span><input v-on:input="props.setSearch(search)" v-model="search"  v-bind:placeholder="searchPlaceholder">'+
			'		</div>'+
			'		<div style="position:fixed;top:56px;line-height:36px;width:100%;height:36px;padding:0px 13px;background:#f2f5fa;">' +
			'			<label>只显示关联备件{{justDeviceRelated}}{{base}}：</label>'+

			'			<yn-switch v-model="justDeviceRelated" @input="onlyShowRelation"></yn-switch>'+
			'       </div>'+
			'	</template>' +
			'	<template v-slot:item-content-wrapper="props">' +
			'		<span class="icon" style="margin-top:40px;"><span></span></span>'+
			'		<dl class="list-dl">'+
			'			<dt>'+
			'				<span>设备编号：</span><span v-html="props.item.sn"></span>'+
			'			</dt>'+
			'			<dd>'+
			'				<span>设备名称：</span><span v-html="props.item.name"></span>'+
			'			</dd>'+
			'			<dd>'+
			'				<span>所属部门：</span><span v-html="props.item.departname"></span>'+
			'			</dd>'+
			'			<dd>'+
			'				<span>负  责  人：</span><span v-html="props.item.nickname"></span>'+
			'			</dd>'+
			'			<dd>'+
			'				<span>存放位置：</span><span v-html="props.item.location_idvalue"></span>'+
			'			</dd>'+
			'		</dl>'+
			'	</template>'+
			'</pageable-list>'
	});
	/**
	 * v-date-select:datetime="Var"
	 * 点后退按钮时自动关闭，取消或确定时自动后退。
	 */
	Vue.directive('DateSelect', {
		bind: function(el, binding, vnode){
			var _this = vnode.context;
			var type = binding.arg || "date";
			var pageName = vnode.data.attrs['page-name'];
			// console.log(_this);
			if(binding.modifiers.now){
				if(!_this[binding.expression]){
					_this[binding.expression] = dateGen.now(type);
				}
			}
			var iosSelect;
			window.addEventListener('prompt:exit', function(){
				if(iosSelect){
					iosSelect.iosSelectLayer.close();
				}
			});
			el.addEventListener('click',function(){
				if(_this.goPage){
					_this.goPage(pageName, true);
				}
				var defaultValue = dateGen.now(type);
				iosSelect = FastIosSelect.date(_this[binding.expression] || defaultValue, function(v){
					_this[binding.expression] = v;
					_this.historyBack();
				}, function(){
					_this.historyBack();
				});
			})
		}
	});
	/**
	 * app元素，路由
	 */
	Vue.component("VueApp", {
		model: {prop: "curPage", event: "change"},
		props: {
			curPage: String,
		},
		data: function(){
			return {
				defaultPage: this.curPage || "index",
			}
		},
		template:
			'<div>' +
			'	<slot></slot>'+
			'</div>',
		created: function(){
			var _this = this;
			var lastIsPrompt = false;
			function onPopHash(){
				console.log("last prompt :", lastIsPrompt);
				if(lastIsPrompt){
					window.dispatchEvent(new Event("prompt:exit"));
				}
				var popHash = getCurHash(_this.defaultPage);
				var curPage;
				if(popHash.indexOf("/") > 0){
					var slices = popHash.split("/");
					curPage = slices[0];
					var promptPageName = slices[1];
					// _this.$el.$emit("pop:prompt", promptPageName);
					_this.$el.dispatchEvent(new Event("prompt:pop"));
				}else {
					curPage = popHash;
				}
				_this.$emit("change", curPage);
			}
			setTimeout(onPopHash, 1);
			/**
			 * 切换显示页，通知更新curPage，设置页面hash
			 * @param pageName 要显示的页面的名称
			 * @param isPrompt 是否时弹出框，如果是，则不更新curPage，并且hash=curPage/promptPageName
			 */
			Vue.prototype.goPage = function (pageName, isPrompt) {
				var hash;
				if(isPrompt){
					hash = this.curPage + "/" + pageName;
					lastIsPrompt = true;
				}else{
					_this.$emit("change", pageName);
					hash = pageName;
				}
				history.pushState(null, '', "#" + hash);
			}
			/**
			 * 前进，后退事件。
			 * 将通知更新curPage，如果hash中包含“/”就要处理是弹出框的情况：
			 * 先将hash分割成[curPage, pageName]
			 */
			window.onpopstate = onPopHash;
		}
	});

	/**
	 * 阻止直接进入或者返回到弹出框页面，不需要参数
	 */
	Vue.directive("back-pop-prompt", {
		bind: function(el, binding, vnode){
			var _this = vnode.context;
			el.addEventListener("prompt:pop", function(){
				_this.historyBack();
			});
		}
	});

	/**
	 * 开关，使用v-model
	 */
	Vue.component('YnSwitch', {
		props: {
			value: [String, Number, Boolean],
			disabled: {
				type: Boolean,
				default: false,
			},
			type: {
				type: String,
			}
		},
		data: function(){
			return {
			}
		},
		methods: {
			change: function(){
				if (this.disabled) {
					return;
				}
				var type = this.type;
				var v = this.value;
				if(!type){
					if(typeof v === "number"){
						type = "number";
					}else if(typeof v === "string"){
						type = "string";
					}else {
						type = "boolean";
					}
				}
				if(type === "number"){
					v = 1 & (!v);
				}else if(type === "string"){
					v = !v? "1": "";
				}else {
					v = !v;
				}
				this.$emit('input', v);
			}
		},
		template:
			'<div class="Switch Switch_Flat" v-bind:class="{On: !!value}" v-on:click="change">'
			+ '	<div class="SwitchLine"></div>'
			+ '	<span class="SwitchButton"></span>'
			+ '</div>'
	});

	Vue.prototype.historyBack = function(){
		history.back();
	}
	Vue.prototype.log = function(text){
		console.log(text);
	};
})(Vue, window.WindService, window.IosSelect);