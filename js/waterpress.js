define(function(require, exports, module) {
	var $ = require('jquery'), juicer = require('juicer');
		
    var con = $('#container'),
        win = $(window),
        tpl = $('#tpl').html(),
        headerHeight = $('#header').height(),

        id = 0, // item's id
        offset = 0, // 在数据库中的偏移位置，默认从0开始

        colWidth = 234,     // 每一列所占的宽度
        maxCol = Math.floor(win.width() / colWidth), // 最大列数
        width = colWidth * maxCol;
    
    $('#header .inner').css('width', width +'px');
    con.css({position: 'relative', width: width +'px'});

    var colsHeight = initCols(maxCol); // 用来记录每一列的总高度

    function loadData(container, postsNum) {
        $.getJSON('index.php?postsNum='+ postsNum +'&offset='+ offset + hasProp(), function(data) {
            if (!data) return; // TODO: 此处应该提示没有数据了
            if (id == 0) $('#loading').hide(10); // id == 0 第一次加载完成时, 隐藏loading

            $.each(data, function(i, item) {
                var minCol = getMinCol(colsHeight);

                // 渲染，TODO: 此处可以做一些动画效果
                container.append(juicer(tpl, {
                    id: id,
                    top: colsHeight[minCol],
                    left: minCol * colWidth,
                    href: item.href,
                    title: item.title,
                    image: item.image,
                    height: item.height,
                    excerpt: item.excerpt,
                    category: item.category,
                    comments: item.comments
                }));

                // 更新当前列高度
                colsHeight[minCol] += 63 + item.height + $('#item-'+ id +' .title').height() + $('#item-'+ id +' .excerpt').height();

                resetConHeight(colsHeight);
                id += 1;
            });  // each
            offset = offset + postsNum;
        }); // getJSON
    }
    loadData(con, 20);

    // 加载更多
    var loadMore = function() {
        var loaded = 0, // 已经加载的次数
            isSend = 0; // 用于判断滚动时是否发送请求
        return function() {
            var minColHeight = colsHeight[0];
            for (var j = 0; j < colsHeight.length; j++) {
                if (colsHeight[j] < minColHeight) {
                    minColHeight = colsHeight[j];
                }
            }

            if (minColHeight + headerHeight - win.scrollTop() - win.height() < 100 && offset > isSend) {

                isSend = offset;
                loadData(con, 15);

            	// 滚动加载3次后，主动点击'更多'按钮时才加载
                // loaded += 1;
                // if (loaded == 3) {
                    // win.unbind('scroll');
                    // $('#more').show().click(function(){
                        // loadMore();
                    // });
                // }
            }
        }
    }();

    // 绑定加载更多的事件
    win.bind('scroll', loadMore);

    // 窗口大小改变时重绘页面布局
    // TODO: 这里应该做一些性能优化
    win.resize(function(){
        maxCol = Math.floor(win.width() / colWidth);
        var colsHeight = initCols(maxCol);

        con.css({position: 'relative', width: maxCol * colWidth +'px'});
        $('#header .inner').css({width: maxCol * colWidth +'px'});

        $('.item').each(function(i) {
            var minCol = getMinCol(colsHeight);

            $(this).css({'top':colsHeight[minCol] +'px', 'left':minCol * colWidth +'px'});
            colsHeight[minCol] +=  $(this).height() + 16;
            resetConHeight(colsHeight);
        });
    });


    // 重置容器的高度
    function resetConHeight(colsHeight) {
        var maxColHeight = 0;
        for (var n = 0; n < colsHeight.length; n++) {
            if (colsHeight[n] > maxColHeight) {
                maxColHeight = colsHeight[n];
            }
        }
        con.css('height', maxColHeight +'px');
    }

    // 产生一个数组，用来记录每列的当前高度，并初始化
    function initCols(n) {
        var x = 0, r = [],
            tagCloud = $('#tag-cloud');
        while(x < n) {
            r[x++] = 0;
        }
        // 把tagCloud的高度加到第一列
        if (tagCloud) {
            r[0] += 42 + tagCloud.height();
        }
        return r;
    }

    // 返回高度最小列的列序号
    function getMinCol(colsHeight) {
        var x = 0, minColHeight = colsHeight[0];
        for (var j = 0; j < colsHeight.length; j++) {
            if (colsHeight[j] < minColHeight) {
                minColHeight = colsHeight[j];
                x = j;
            }
        }
        return x;
    }

    // 分类、标签
    function hasProp() {
        var loc = location.href,
            cat = '',
            tag = '';
        if (loc.indexOf('cat=') != -1) {
            loc.replace(/cat=([^\&]+)/i, function(a, b) {
                cat = b;
            });
            return '&cat='+ cat;
        } else if (loc.indexOf('tag=') != -1) {
            loc.replace(/tag=([^\&]+)/i, function(a, b) {
                tag = b;
            });
            return '&tag='+ tag;
        } else {
            return '';
        }
    }

});
