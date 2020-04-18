(function($){
    function assertTrue(res){
        if((res instanceof Function && !res()) || !res){
            throw "not true:" + res
        }
    }
    function dataCopy(data){
        if(!(typeof data == "object")){
            return data;
        }
        return JSON.parse(JSON.stringify(data));
    }
    function create(tagName, className, parent, innerHtml){
        var e = document.createElement(tagName);
        if(!!className){
            e.className = className;
        }
        if(!!parent){
            parent.appendChild(e);
        }
        if((!!innerHtml) || typeof innerHtml == "number"){
            e.innerHTML = innerHtml;
        }
        return e;
    }
    function groupBy(list, key, preFunc){
       if(!list || !list.length){
           return {};
       }
       var isFuncKey = key instanceof Function;
       var map = {};
       for(var i = 0; i < list.length; i++){
           var item = list[i];
           if(preFunc instanceof Function){
        	   list[i] = item = preFunc(item);
           }
           var k = isFuncKey? key(item): item[key];
           if(!map[k]){
               map[k] = [];
           }
           map[k].push(item);
       }
       return map;
   }
   function setElementData(e, datas){
       for(var k in datas){
           e.dataset[k] = datas[k];
       }
   }
   function toMap(list, kFunc, vFunc){
       if(!(list && list.length)){
           return {};
       }
       var map = {};
       for(var i = 0; i < list.length; i++){
           var item = list[i];
           map[kFunc(item)] = vFunc(item);
       }
       return map;
   }
   function toKMap(list, k){
       return toMap(list, function(data){
           return k instanceof Function? k(data): data[k];
       }, function(data){
           return data;
       })
   }
   function toKVMap(list, k, v){
       function exec(data, executor){
            return executor instanceof Function? executor(data): data[executor];
       }
       return toMap(list, function(data){
          return  exec(data, k)
       }, function(data){
           return  exec(data, v)
       })
   }
   function toTree(data, key, pKey){
	   var rootList = [];
		var map = iUtils.toKMap(data, key);
		for(var i = 0 ; i < data.length; i++){
			var d = data[i];
			var pid = d[pKey];
			if(pid){
				var parent = map[pid];
				if(parent){
					var children = parent.children;
					if(!children){
						children = parent.children = [];
					}
					children.push(d);
				}else {
					rootList.push(d);//父节点不存在也添加，位置树中父节点可能为分公司
				}
			}else {
				rootList.push(d);
			}
		}
		return rootList;
   }
   function distinctBy(list, k){
       var map = {};
       var arr = [];
       for(var i = 0; i < list.length; i++){
           var item = list[i];
           var key = k instanceof Function? k(item): item[k];
           if(map[key]){
               continue;
           }
           map[key] = true;
           arr.push(item);
       }
       return arr;
   }
   function map(list, func){
       if(!(list && list.length)){
           return [];
       }
       list = dataCopy(list);
       var arr = [];
       for(var i = 0; i < list.length; i++){
           arr[i] = func(list[i]);
       }
       return arr;
   }
   function reduce(list, func){
       if(!(list && list.length)){
           return void(0);
       }
       list = dataCopy(list);
       var result = list[0];
       for(var i = 1; i < list.length; i++){
            result = func(list[i], result);
       }
       return result;
   }
   function filter(list, func){
	   if(!(list && list.length)){
		   return void(0)
	   }
	   list = dataCopy(list);
	   var result = [];
	   for(var i = 0; i < list.length; i++){
		   if(!func(list[i])){
			   result.push(list[i])
		   }
	   }
	   return result;
   }
   function deleteByFunc(list, func){
	   for(var i = 0; i < list.length; i++){
		   if(func(list[i])){
			   list.splice(i, 1);
			   i--;
		   }
	   }
   }
   function safeStr(str){
        return str || "";
   }
   function safeArr(arr){
        return arr || [];
   }
   function safeObj(obj){
        return obj || {};
   }
   function absoluteCenter(){
        var position = this.css("position");
        if(position !== "absolute" || position !== "fixed"){
            this.css("position", "absolute");
        }
        this.height(this.height());
        this.width(this.width());
        this.css("top", 0);
        this.css("right", 0);
        this.css("bottom", 0);
        this.css("left", 0);
        this.css("margin", "auto");
        return this;
   }
   function isPositiveInteger(res){
        return /^[1-9][0-9]*$/.test(res);
   }
   function isNaturalNumber(res){
        return /^(0|[1-9][0-9]*)$/.test(res);
   }
   function isFloat(res, accuracy){
        var useAccuracy = typeof accuracy == "number";
        if(typeof res == "number"){
        	if(res + "" === "NaN"){
        		return false;
        	}
            if(useAccuracy){
                var arr = (res + "").split(".");
                if(arr.length > 1){
                    return arr[1].length <= accuracy;
                }
            }
            return true;
        }
        var pattern = "^-?(0|[1-9][0-9]*)(\\.[0-9]" + (useAccuracy? "{1," + accuracy + "}": "{1,}") + ")?$";
        return new RegExp(pattern).test(res);
   }
   function fixed(number, accuracy, policy){
        if(typeof number != "number" && !isFloat(number)){
            throw "not a number";
        }
        number = numToString(number);
        var temp = number.split(".");
        if(temp.length <= 1 || temp[1].length <= accuracy){
        	return number;
        }
        var pow = Math.pow(10, accuracy);
        return Math[policy || "ceil"](numToString(number) * pow) / pow;
   }
   function getPowToInt(number){
        if(typeof number != "number" && !isFloat(number)){
            throw "not a number";
        }
        var num = number + "";
        if(num.indexOf(".") < 0){
            return 0;
        }
        return (number + "").split(".")[1].length;
   }
   function mulCal(a, b){
        if(!isFloat(a) || !isFloat(b)){
            throw "not a number";
        }
        var powA = Math.pow(10, getPowToInt(a));
        var powB = Math.pow(10, getPowToInt(b));
        a = (a + "").split(".").join("");
        b = (b + "").split(".").join("");
        return a * b /(powA * powB);
   }
   function devide(n,m){
     n=typeof n =="string"?n: numToString(n);
     m=typeof m =="string"?m: numToString(m);
     var F= n.indexOf(".")!=-1? handleNum(n):[n,0,0],
         S= m.indexOf(".")!=-1? handleNum(m):[m,0,0],
         l1=F[2],
         l2=S[2],
         L=l1>l2?l1:l2,
         T=Math.pow(10,L);
     return ((F[0]*T+F[1]*T/Math.pow(10,l1))/(S[0]*T+S[1]*T/Math.pow(10,l2)))
   }
   function subtractCal(a, b){
        if(!isFloat(a) || !isFloat(b)){
            throw "not a number";
        }
        var pA = getPowToInt(a);
        var pB = getPowToInt(b);
        a = (a + "").split(".").join("");
        b = (b + "").split(".").join("");
        var pow = Math.pow(10, Math.abs(pA - pB));
        if(pA > pB){//a的小数位更多
            b *= pow;
        }else {
            a *= pow;
        }
        return (a - b) / Math.pow(10, pA > pB? pA: pB);
   }
   function handleNum(n){
	     n=typeof n !=="string"?n+"":n;
	     var temp= n.split(".");
	     temp.push(temp[1].length);
	     return temp
   }
   function addAll(arr, arr2){
		if(arr2){
			if(arr2 instanceof Array){
				for(var i = 0; i < arr2.length; i++){
					arr.push(arr2[i]);
				}
			}
		}
		return arr;
	}
   function mergeArray(list, list2){
		if(!list){
			return list2;
		}
		if(!list2){
			return list;
		}
		
		var res = [];
		
		var arr = [list, list2];
		for(var z = 0; z < arr.length; z++){
			var sub = arr[z];
			for(var i = 0; i < sub.length; i++){
				res.push(sub[i]);
			}
		}
		return res;
	}
   function plus(n,m){
	     n=typeof n =="string"?n: numToString(n);
	     m=typeof m =="string"?m: numToString(m);
	     var F= n.indexOf(".")!=-1? handleNum(n):[n,0,0],
	         S= m.indexOf(".")!=-1? handleNum(m):[m,0,0],
	         l1=F[2],
	         l2=S[2],
	         L=l1>l2?l1:l2,
	         T=Math.pow(10,L);
	     return (F[0]*T+F[1]*T/Math.pow(10,l1)+S[0]*T+S[1]*T/Math.pow(10,l2))/T

	 }
   function Calcu(num, p){
	   if(!(typeof num == "number" || num.length > 0)){
		   return;
	   }
	   num = safeNum(num);
	   check(isFloat(num));
	   this.exp = p? p: ("" + num);
	   this.add = function(n){
		   n = safeNum(n);
		   return new Calcu(plus(num, n), this.exp + " + " + n);
	   }
	   this.sub = function(n){
		   n = safeNum(n);
		   return new Calcu(subtractCal(num, n), this.exp + " - " + n);
	   }
	   this.mutiply = function(n){
		   n = safeNum(n);
		   return new Calcu(mulCal(num, n), "(" + this.exp + ") * " + n);
	   }
	   this.devide = function(n){
		   n = safeNum(n);
		   return new Calcu(devide(num, n), "(" + this.exp + ") / " + n);
	   }
	   this.get = function(accuracy, policy){
		   var result = (typeof accuracy == "number"? (policy? fixed(num, accuracy, policy): fixed(num, accuracy)): num);
		   console.log(this.exp + " = " + result);
		   return result;
	   }
   }
   
   function check(express, msg){
	   msg = msg || " a check error accurred.";
	   if(!express){
		   throw msg
	   }
   }
   function each(func){
	   for(var i = 0; i < this.length; i++){
		   func(this[i], i, this);
	   }
   }
   function numToString(tempArray){
	 if(typeof tempArray == "string"){
		 return tempArray;
	 }
     if(Object.prototype.toString.call(tempArray) == "[object Array]"){
         var temp=tempArray.slice();
         for(var i,l=temp.length;i<l;i++){
             temp[i]=typeof temp[i] == "number"?temp[i].toString():temp[i];
         }
         return temp;
     }
     if(typeof tempArray=="number"){
         return tempArray.toString();
     }
     return []
  }
   function preventInputFloatOverflow(accuracy){
	   $(document).on("keyup", "input", function(){
		   var v = this.value;
		   accuracy = this.dataset.accuracy || accuracy;
		   if(isFloat(v)){
			   v = numToString(v);
			   v = fixed(v, accuracy);
			   this.value = v;
		   }
	   })
   }
   function safeNum(n){
	   return n || 0;
   }

   function Trim(v){
   	if(typeof v == "string"){
   		return v.trim();
   	}
   	return v;
   }
   
   

   function CheckGroup(opts){
		opts = $.extend({}, opts);
		var checker = ".checker";
		var checkAllClass = "check-all";
		var checkAll = "." + checkAllClass;
		var checkItem = ".check-item";
		var container = opts["container"] || $(document.body);
		var asRadio = !!opts["asRadio"];
		var dataKey = opts["dataKey"] || "id";
		var checkAllIds = [];
		var checkAllData = [];
		var table = opts["table"] || false;
		var callback = opts["callback"] || false;
		function checkGroup(dom){
			if(!asRadio && itemCount(dom)) {
				dom.find(checkAll)[0].checked = allChecked(dom);
			}
			dom.off("click", checker).on("click", checker, function(){//复选
				var jqCheck = $(this);
				if(jqCheck.hasClass(checkAllClass)){
					if(asRadio){
						return;
					}
					container.find(checker+":not("+checkAll+")").each(function(){
						this.checked = jqCheck[0].checked;
					})
					if(jqCheck[0].checked){//选中所有
						container.find(checker+":not("+checkAll+")").each(function(){
							if(checkAllIds.indexOf($(this).data(dataKey))==-1){
								checkAllIds.push($(this).data(dataKey));
							}
							if(!checkAllData[$(this).data(dataKey)] && table && callback instanceof Function){
								callback(table,$(this),checkAllData);
							}
						})
					}else{
						container.find(checker+":not("+checkAll+")").each(function(){
							checkAllIds = arrayUtils.remove(checkAllIds,$(this).data(dataKey));
						})
					}
				}else {
					if(asRadio){
						container.find(checker+":not("+checkAll+")").not(jqCheck).each(function(){
							this.checked = false;
						});
						return;
					}
					container.find(checkAll)[0].checked = allChecked(container);
					if(jqCheck[0].checked){
						checkAllIds.push(jqCheck.data(dataKey));
						if(!checkAllData[jqCheck.data(dataKey)] && table && callback instanceof Function){
							callback(table,jqCheck,checkAllData);
						}
					}else{
						checkAllIds = arrayUtils.remove(checkAllIds,jqCheck.data(dataKey));
					}
					
				}
				console.log(checkAllIds);
				console.log(checkAllData);
			});
		}
		
		function allChecked(dom){
			var allChecked = true;
			dom.find(checker+":not("+checkAll+")").each(function(){
				if(!this.checked){
					allChecked = false;
				}
			});
			return allChecked;
		}
		function itemCount(dom){
			return dom.find(checker+":not("+checkAll+")").length;
		}
		function getChecked(dataKey){
			dataKey = dataKey || "id";
			var datas = [];
			container.find(checkItem + ":checked").each(function(){
				datas.push($(this).data(dataKey));
			});
			return datas;
		}
		checkGroup(container);
		this.getChecked = getChecked;
		this.checkAllIds = checkAllIds;
		this.autoSetSelect = function(){//自动选中
			var _selectIds  = checkAllIds;
			if(_selectIds && _selectIds.length>0){
				for(var key in _selectIds){
					var v= _selectIds[key];
					$("input[data-id='"+v+"'][type='checkbox']").prop("checked",true);
				}
			}
		}
		this.getAllCheckData = function(){//获取被选中的数据集合
			var checkData =  [];
			if(checkAllData.length >0 && checkAllIds.length > 0){
				for(var key in checkAllIds){
					checkData.push(checkAllData[checkAllIds[key]]);
				}
			}
			return checkData;
		}
		this.getAllCheckedIds = function(){
			var arr = [];
			if(checkAllIds && checkAllIds.length > 0){
				for(var i = 0; i < checkAllIds.length; i++){
					arr.push(checkAllIds[i]);
				}
			}
			return arr;
		}
		this.clear=function(){
			checkAllIds = [];
			checkAllData = [];
		}
	}
  
   function removeArray (arr,ele){
   	var index  = arr.indexOf(ele);
   	if(index > -1){
   		arr.splice(index,1);
   	}
   	return arr ;
   }
   
   
	function lazySelectpicker(){
		$(document.body).off("mouseover", ".lazy-selectpicker:not(.selectpicker-inited)").on("mouseover", ".lazy-selectpicker:not(.selectpicker-inited)", function(){
			var jqSelect = $(this);
			if(!jqSelect.hasClass("selectpicker")){
				jqSelect.addClass("selectpicker");
			}
			jqSelect.selectpicker("refresh");
			jqSelect.addClass("selectpicker-inited");
		});
	}
	function isIp(ip){
		return /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/.test(ip);
	}
	
	function getCalTime(time,value,type){
		if(!time || !value || !type ){
			return ;
		}
		var curTime = new Date(time);
		if(type == 0){//年
			curTime.setFullYear(curTime.getFullYear()+parseInt(value));
		}else if(type == 1){//月
			curTime.setMonth(curTime.getMonth()+parseInt(value));
		}else if(type == 2){//日
			curTime.setDate(curTime.getDate()+parseInt(value));
		}else if(type ==  3){//小时
			curTime.setHours(curTime.getHours()+parseInt(value));
		}
		return $.sdu.getDataYMD(curTime);
	}
	
	function toTime(cycle,cycle_unit){
		var cn = 0;
		if(cycle !== undefined && cycle !== null){
			if(cycle_unit == 1){
				cn = cycle*24;//天
			}
			if(cycle_unit == 2){
				cn = cycle*30*24;//月
			}
			if(cycle_unit == 3){
				cn = cycle*12*30*24;//年
			}
		}
		return cn;
	}
	
	function getInervalHour (startDate, endDate) {
        var ms =  new Date(endDate).getTime() - new Date(startDate).getTime();
        if (ms < 0) return 0;
        return Math.floor(ms/1000/60/60);
    }
	
	function getObjValues (data){
		var result = [];
		var keys = Object.keys(data);
		for(var key in keys){
			result.push(data[keys[key]]);
		}
		return result;
	}
	function sort(arr, func){
		for(var i = 0; i < arr.length - 1; i++){
			for(var j = i + 1; j < arr.length; j++){
				var res = func(arr[i], arr[j]);
				if(res > 0){
					var temp = arr[i];
					arr[i] = arr[j];
					arr[j] = temp;
					console.log("swap " + arr[i] + "," + arr[j]);
				}
			}
		}
		return arr;
	}
	
	function getDevSnFromURL(url){
		if(!url || url.indexOf("=") == -1){
			return url;
		}
		var _ps = url.split("=");
		console.log(_ps);
		return _ps[3]||"";
	}
	function addAll(arr, arr2){
		if(arr2){
			if(arr2 instanceof Array){
				for(var i = 0; i < arr2.length; i++){
					arr.push(arr2[i]);
				}
			}
		}
		return arr;
	}

	function toIdValueArr(map){
		var arr = [];
		for(var k in map){
			var v = map[k];
			arr.push({id: k, value: v});
		}
		return arr;
	}
	function getFieldArr(arr, k){
		var res = [];
		each.call(arr, function(e){
			res.push(e[k]);
		});
		return res;
	}
	function toSet(arr){
		 var map = {};
		 for(var i = 0; i < arr.length; i++){
			 map[arr[i]] = true;
		 }
		 return map;
	}
	function nowStr(isDate){
		var d = new Date();
		return simpleDateFormat(d, !isDate);
	}
	function simpleDateParse(str, isDateTime){
		str = str.replace(/-/g, '/');
		var d = new Date(str);
		return d;
	}
	function simpleDateFormat(d, isDateTime){
		function zeroPadding(v){
			return (v < 10? '0': '') + v;
		}
		var str = d.getFullYear() + '-' + zeroPadding(d.getMonth() + 1) + '-' + zeroPadding(d.getDate());
		if(isDateTime){
			str += ' ' + zeroPadding(d.getHours()) + ":" + zeroPadding(d.getMinutes()) + ":" + zeroPadding(d.getSeconds());
		}
		return str;
	}
	function dateAdd(d, day){
		var d = new Date();
		d.setTime(d.getTime() + day * 24*60*60*1000);
		return d;
	}
	function isNumber(value){
		return typeof value === "number";
	}
	function getControlData(controls, config){
		config = $.extend({}, config);
		controls = $(controls);
		var map = {};
		for(var i = 0; i < controls.length; i++){
			var control = controls.eq(i);
			var v = control.val();
			if(config.valueProcess){
				v = config.valueProcess(v);
			}
			map[control.attr("name")] = v;
		}
		if(config.serialize){
			return parameterSerilize(map);
		}else {
			return map;
		}
	}
	function parameterSerilize(params){
		var str = "";
		for(var k in params){
			var v = params[k];
			if(v === undefined || v === null){
				v = "";
			}
			if(str.length){
				str += "&";
			}
			str += k + "=" + v;
		}
		return str;
	}
	function setControlData(controls, map, config){
		config = $.extend({
			safeValue: true,
		}, config);
		controls = $(controls);
		for(var i = 0; i < controls.length; i++){
			var control = controls.eq(i);
			var name = control.attr("name");
			var value = map[name];
			if(config.safeValue && value === null){
				value = "";
			}
			if(config.settext){
				control.text(value)
			}else {
				control.val(value).trigger("change");
			}
		}
	}
	function getSelectByMap(map, value, attrs){
		var html = "<select "+(!!attrs? attrs: "")+">";
		for(var k in map){
			var text = map[k];
			html += "<option value='"+k+"'  "+(value == k? "selected": "")+">" + text + "</option>";
		}
		html += "</select>";
		return html;
	}
	function textareaText(text){
		return text.replace(/(\r\n|\r|\n)/ig, "<br>");
	}
	function indexRows(rows){
		rows = $(rows);
		if(rows && rows.length){
			for(var i = 0; i < rows.length; i++){
				rows.eq(i).text(i + 1);
			} 
		}
	}
	function $remove(e, target, ischild, allParents){
		if(ischild){
			target = $(e).find(target);
		}else {
			target = $(e).parents(target);
			if(!allParents){
				target = target.first();
			}
		}
		target.remove();
	}
	function initSelect2(){
		$(".select2.un-inited").removeClass("un-inited").select2();
	}
	function getCheckBox(config){
		if(!config){config = {}}
		var html = '<div class="pretty success" style="margin: 0;">';
		html += '  <input ';
		if(config.checked){
			html += ' checked ';
		}
		if(config.dataid){
			html += ' data-id="'+config.dataid+'" '
		}
		html += ' type="checkbox" class="checker check-item ';
		if(config.classname){
			html += config.classname;
		}
		html += '">';
	    html += '  <label><i class="mdi mdi-check"></i></label>';
		html += '</div>';
		return html;
	}
	function getHtmlRow(arr, func){
		var html = "";
		if(arr){
			for(var i = 0; i < arr.length; i++){
				html += func(arr[i], i+1);
			}
		}
		return html;
	}
	function remove(obj, key){
		if(obj instanceof Array){
			var len = obj.length;
			for(var i = 0; i < len; i++){
				var v = obj[i];
				if(v == key){
					obj.splice(i, 1);
					len--;
					i--;
				}
			}
		}
	}
	function removeInSet(obj, set, removeNotIn, objKey){
		if(obj instanceof Array){
			var len = obj.length;
			for(var i = 0; i < len; i++){
				var v = obj[i];
				if(objKey){
					v = v[objKey];
				}
				if(set instanceof Array){
					set = iUtils.toSet(set);
				}
				var exists = v in set;
				if((removeNotIn && !exists) || (!removeNotIn && exists)){
					obj.splice(i, 1);
					len--;
					i--;
				}
			}
		}
	}
	function safeObjValue(obj){
		for(var k in obj){
			var v = obj[k];
			if(v === undefined || v === null){
				obj[k] = "";
			}
		}
	}
	
	function textAreaText(value){
		return value && value.replace(/(\r\n|\r|\n)/gm, "<br/>");
	}
	function ifNumber(obj, falseRes){
		if(typeof obj === "number"){
			return obj;
		}else {
			return falseRes;
		}
	}
	
   window.iUtils = {
		addAll:addAll,
		getFieldArr: getFieldArr,
		sort: sort,
        dataCopy: dataCopy,
        groupBy: groupBy,
        safeStr: safeStr,
        safeArr: safeArr,
        safeObj: safeObj,
        safeNum: safeNum,
        create: create,
        setElementData: setElementData,
        toMap: toMap,
        toKMap: toKMap,
        toKVMap: toKVMap,
        distinctBy: distinctBy,
        map: map,
        reduce: reduce,
        isPositiveInteger: isPositiveInteger,
        isNaturalNumber: isNaturalNumber,
        isFloat: isFloat,
        fixed: fixed,
        mulCal: mulCal,
        subtractCal: subtractCal,
        deleteByFunc: deleteByFunc,
        check: check,
        each: each,
        plus: plus,
        devide: devide,
        numToString: numToString,
        preventInputFloatOverflow: preventInputFloatOverflow,
        Calcu: Calcu,
        filter: filter,
        Trim: Trim,
        CheckGroup: CheckGroup,
        lazySelectpicker:lazySelectpicker,
        toTree: toTree,
        isIp: isIp,
        getCalTime:getCalTime,
        toTime:toTime,
        getInervalHour:getInervalHour,
        getObjValues:getObjValues,
        getDevSnFromURL:getDevSnFromURL,
        addAll: addAll,
        toIdValueArr: toIdValueArr,
        
        toSet: toSet,
        nowStr: nowStr,
        dateAdd: dateAdd,
        simpleDateFormat: simpleDateFormat,
        simpleDateParse: simpleDateParse,
        isNumber: isNumber,
        getControlData: getControlData,
        getSelectByMap: getSelectByMap,
        setControlData: setControlData,
        textareaText: textareaText,
        indexRows: indexRows,
        $remove: $remove,
        initSelect2: initSelect2,
        parameterSerilize: parameterSerilize,
        getCheckBox: getCheckBox,
        getHtmlRow: getHtmlRow,
        remove: remove,
        safeObjValue: safeObjValue,
        textAreaText: textAreaText,
        ifNumber: ifNumber,
        removeInSet: removeInSet,
        mergeArray: mergeArray,
   };
   $.fn.absoluteCenter = absoluteCenter;
	;(function(){
		var registed = {};
		$.fn.chooseRowContainer = function (opts){
			opts = $.extend({
				chooseAble: "tr",
				chooseClass: "chooseRow",
			}, opts);
			
			for(var i = 0; i < this.length; i++){
				var _this = this.eq(i);
				if(registed[_this[0]]){
					continue;
				}
				registed[_this[0]] = opts;
				_this.on("click", opts.chooseAble, function(){
					_this.find(opts.chooseAble).removeClass(opts.chooseClass);
					$(this).addClass(opts.chooseClass);
				});
			}
			
			return this;
		}
		$.fn.getChoosedRow = function(){
			var _this = this;
			var opts = registed[_this[0]];
			if(!opts){
				return;
			}
			return _this.find("." + opts.chooseClass);
		}
	})();
})(jQuery)