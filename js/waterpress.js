// (function() {
// 	seajs.config({
// 		alias: {
// 			'jquery': 'jquery',	
// 		}
// 	});	
// })();

define(function(require, exports, module) {
	var $ = require('jquery'),
		juicer = require('juicer');
		
    var con = $('#container'),
        win = $(window),
        colWidth = 234,
        arr_height = [],
        id = 0, // item's id

        isSend = 0, // 用于判断滚动时是否发送请求
        offset = 0, // 在数据库中的偏移位置，默认为0
        maxCols = Math.floor(win.width() / colWidth), // 最大列数

        tpl = $('#tpl').html(),
        headerHeight = $('#header').height();

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
        var minColHeight = arr_height[0];
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

});
