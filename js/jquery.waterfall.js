/** juicer
	@author: guokai
	@email/gtalk: badkaikai@gmail.com
	@blog/website: http://benben.cc
	@license: apache license,version 2.0
	@version: 0.3.0-dev
*/
(function() {
	var juicer=function() {
		var args=[].slice.call(arguments);
		args.push(juicer.options);
		if(arguments.length==1) return juicer.compile.apply(juicer,args);
		if(arguments.length>=2) return juicer.to_html.apply(juicer,args);
	};

	this.__escapehtml={
		__escapehash:{
			'<':'&lt;',
			'>':'&gt;',
			'"':'&quot;',
			'&':'&amp;'
		},
		__escapereplace:function(k) {
			return __escapehtml.__escapehash[k];
		},
		__escape:function(str) {
			return typeof(str)!=='string'?str:str.replace(/[&<>"]/igm,__escapehtml.__escapereplace);
		},
		__detection:function(data) {
			return typeof(data)==='undefined'?'':data;
		}
	};

	juicer.__cache={};
	juicer.version='0.3.0-dev';

	juicer.settings = {
		forstart:/{@each\s*([\w\.]*?)\s*as\s*(\w*?)(,\w*?)?}/igm,
		forend:/{@\/each}/igm,
		ifstart:/{@if\s*([^}]*?)}/igm,
		ifend:/{@\/if}/igm,
		elsestart:/{@else}/igm,
		interpolate:/\${([\s\S]+?)}/igm,
		noneencode:/\$\${([\s\S]+?)}/igm,
		inlinecomment:/{#[^}]*?}/igm,
		rangestart:/{@each\s*(\w*?)\s*in\s*range\((\d+?),(\d+?)\)}/igm
	};

	juicer.options={
		cache:true,
		strip:true,
		errorhandling:true
	};

	juicer.set=function(conf,value) {
		this.options[conf]=value;
	};

	juicer.template=function() {
		var __this=this;

		this.__interpolate=function(varname,escape,options) {
			var __define=varname.split('|'),fn='';
			if(__define.length>1) {
				varname=__define.shift();
				fn=__define.shift();
			}
			return '<%= '+
						(escape?'__escapehtml.__escape':'')+
							'('+
								(!options || options.detection!==false?'__escapehtml.__detection':'')+
									'('+
										fn+
											'('+
												varname+
											')'+
									')'+
							')'+
					' %>';
		};

		this.__shell=function(tpl,options) {
			var iterate_count=0;
			tpl=tpl
				//for expression
				.replace(juicer.settings.forstart,function($,varname,alias,key) {
					var alias=alias||'value',key=key && key.substr(1);
					var iterate_var='i'+iterate_count++;
					return '<% for(var '+iterate_var+'=0,l='+varname+'.length;'+iterate_var+'<l;'+iterate_var+'++) {'+
								'var '+alias+'='+varname+'['+iterate_var+'];'+
								(key?('var '+key+'='+iterate_var+';'):'')+
							' %>';
				})
				.replace(juicer.settings.forend,'<% } %>')
				//if expression
				.replace(juicer.settings.ifstart,function($,condition) {
					return '<% if('+condition+') { %>';
				})
				.replace(juicer.settings.ifend,'<% } %>')
				//else expression
				.replace(juicer.settings.elsestart,function($) {
					return '<% } else { %>';
				})
				//interpolate without escape
				.replace(juicer.settings.noneencode,function($,varname) {
					return __this.__interpolate(varname,false,options);
				})
				//interpolate with escape
				.replace(juicer.settings.interpolate,function($,varname) {
					return __this.__interpolate(varname,true,options);
				})
				//clean up comments
				.replace(juicer.settings.inlinecomment,'')
				//range expression
				.replace(juicer.settings.rangestart,function($,varname,start,end) {
					var iterate_var='j'+iterate_count++;
					return '<% for(var '+iterate_var+'=0;'+iterate_var+'<'+(end-start)+';'+iterate_var+'++) {'+
								'var '+varname+'='+iterate_var+';'+
							' %>';
				});

			//exception handling
			if(!options || options.errorhandling!==false) {
				tpl='<% try { %>'+tpl+'<% } catch(e) {console && console.warn("Juicer Render Exception: "+e.message);} %>';
			}

			return tpl;
		};

		this.__pure=function(tpl,options) {
			return this.__convert(tpl,!options || options.strip);;
		};

		this.__lexical=function(tpl) {
			var buf=[];
			var pre='';
			var indexOf=function(arr,value) {
				for(var i=0;i<arr.length;i++) {
					if(arr[i]==value) return i;
				}
				return -1;
			};
			var memo=function($,variable) {
				variable=variable.match(/\w+/igm)[0];
				(buf.indexOf?buf.indexOf(variable):indexOf(buf,variable))===-1 && buf.push(variable);//fuck ie
			};

			tpl.replace(juicer.settings.forstart,memo).
				replace(juicer.settings.interpolate,memo).
				replace(juicer.settings.ifstart,memo);

			for(var i=0;i<buf.length;i++) {
				pre+='var '+buf[i]+'=data.'+buf[i]+';';
			}
			return '<% '+pre+' %>';
		};

		this.__convert=function(tpl,strip) {
			var buf=[].join('');
			buf+="var data=data||{};";
			buf+="var out='';out+='";
			if(strip!==false) {
				buf+=tpl
						.replace(/\\/g,"\\\\")
						.replace(/[\r\t\n]/g," ")
						.replace(/'(?=[^%]*%>)/g,"\t")
						.split("'").join("\\'")
						.split("\t").join("'")
						.replace(/<%=(.+?)%>/g,"';out+=$1;out+='")
						.split("<%").join("';")
						.split("%>").join("out+='")+
						"';return out;";
			} else {
				buf+=tpl
						.replace(/\\/g,"\\\\")
						.replace(/[\r]/g,"\\r")
						.replace(/[\t]/g,"\\t")
						.replace(/[\n]/g,"\\n")
						.replace(/'(?=[^%]*%>)/g,"\t")
						.split("'").join("\\'")
						.split("\t").join("'")
						.replace(/<%=(.+?)%>/g,"';out+=$1;out+='")
						.split("<%").join("';")
						.split("%>").join("out+='")+
						"';return out.replace(/[\\r\\n]\\t+[\\r\\n]/g,'\\r\\n');";
			}
			return buf;
		};

		this.parse=function(tpl,options) {
			if(!options || options.loose!==false) tpl=this.__lexical(tpl)+tpl;
			tpl=this.__shell(tpl,options);
			tpl=this.__pure(tpl,options);
			tpl='"use strict";'+tpl; //use strict mode

			this.render=new Function('data',tpl);
			return this;
		};
	};

	juicer.compile=function(tpl,options) {
		try {
			var engine=this.__cache[tpl]?this.__cache[tpl]:new this.template().parse(tpl,options);
			if(!options || options.cache!==false) this.__cache[tpl]=engine;
			return engine;
		} catch(e) {
			console && console.warn('Juicer Compile Exception: '+e.message);
			return {render:function() {}};
		}
	};

	juicer.to_html=function(tpl,data,options) {
		return this.compile(tpl,options).render(data);
	};

	typeof(module)!=='undefined' && module.exports?module.exports=juicer:this.juicer=juicer;
})();

(function($) {
    var con = $('#container'),
        win = $(window),
        colWidth = 234,
        arr_height = [],
        id = 0, // item's id
        isSend = 0, // 用于判断滚动时是否发送请求
        offset = 0, // 在数据库中的偏移位置，默认为0
        maxCols = Math.floor(win.width() / colWidth), // 最大列数
        tpl = $('#tpl').html();

    for (var x = 0; x < maxCols; x++) {
        arr_height[x] = 0;
    }
    
    con.css({position: 'relative', width: maxCols * colWidth +'px'});
    $('#header .inner').css({width: maxCols * colWidth +'px'});

    function getData(postsNum) {
    	var cat = '', 
    		loc = location.href;
    	if (loc.indexOf('cat=') != -1) {
    		loc.replace(/cat=([^\&]+)/i, function(a, b){
    			cat = '&cat='+ b;
    		});
    	}
        $.getJSON('index.php?postsNum='+ postsNum +'&offset='+ offset + cat, function(data) {
            if (!data) return;
            if (id == 0) $('#loading').hide(10);
            $.each(data, function(i, item) {
                var xPos = 0;
                if (id >= maxCols) {
                    // 查找高度最小的列
                    var minColHeight = arr_height[0];
                    for (var j = 0; j < arr_height.length; j++) {
                        if (arr_height[j] < minColHeight) {
                            minColHeight = arr_height[j];
                            xPos = j;
                        }
                    }
                } else {
                    xPos = i;
                }

                //渲染
                con.append(juicer(tpl, {
                    id: id,
                    top: arr_height[xPos],
                    left: xPos * colWidth,
                    href: item.href,
                    title: item.title,
                    image: item.image,
                    height: item.height,
                    excerpt: item.excerpt,
                    category: item.category,
                    comments: item.comments
                }));

                arr_height[xPos] += 63 + item.height + $('#item-'+ id +' .title').height() + $('#item-'+ id +' .excerpt').height();  // 更新当前列高度

                setConHeight();
                id = id + 1;
            });  //each
            offset = offset + postsNum;
        }); //getJSON
    }
    getData(20); //默认加载的20条

    // 加载更多
    var loaded = 0;
    function loadMore() {
        var headerHeight = $('#header').height(),
            minColHeight = arr_height[0];
        for (var j = 0; j < arr_height.length; j++) {
            if (arr_height[j] < minColHeight) {
                minColHeight = arr_height[j];
            }
        }

        if (minColHeight + headerHeight - win.scrollTop() - win.height() < 100 && offset > isSend) {

            isSend = offset;
            getData(6);

        	//滚动加载3次后，主动点击'更多'按钮时才加载
        	loaded += 1;
	        if (loaded == 3) {
	        	win.unbind('scroll');
			    $('#more').show().click(function(){
			        loadMore();
	    		});
	        }
        }
    }

    // 绑定加载更多的事件
    win.bind('scroll', loadMore);

    // 窗口大小改变时重绘页面布局
    win.resize(function(){
        arr_height = [];
        maxCols = Math.floor(win.width() / colWidth);
        for (var x = 0; x < maxCols; x++) {
            arr_height[x] = 0;
        }

        con.css({position: 'relative', width: maxCols * colWidth +'px'});
        $('#header .inner').css({width: maxCols * colWidth +'px'});

        $('.item').each(function(i) {
            var xPos = 0;
            if (i >= maxCols) {
                // 查找高度最小的列
                var minColHeight = arr_height[0];
                for (var j = 0; j < arr_height.length; j++) {
                    if (arr_height[j] < minColHeight) {
                        minColHeight = arr_height[j];
                        xPos = j;
                    }
                }
            } else {
                xPos = i;
            }
            $(this).css({'top':arr_height[xPos] +'px', 'left':xPos * colWidth +'px'});
            arr_height[xPos] +=  $(this).height() + 16;
            setConHeight();
        });
    });

    // 计算列高度
    function setConHeight() {
        var maxColHeight = 0;
        for (var n = 0; n < arr_height.length; n++) {
            if (arr_height[n] > maxColHeight) {
                maxColHeight = arr_height[n];
            }
        }
        con.css('height', maxColHeight +'px');
    }

})(jQuery);
