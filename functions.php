<?php
//获取文章中第一张图片
function get_first_image() {
    global $post;
    preg_match('/<img.+src=[\'"]([^\'"]+)[\'"].*>/i', $post->post_content, $matches);

    if ( count($matches) ) {
        return $matches[1];
    } else {
        return false;
    }
}

//开启主题支持菜单
add_theme_support('menus');
//开启主题支持缩略图
// add_theme_support( 'post-thumbnails' ); 

//时间显示方式‘xx以前’
function time_ago( $type = 'commennt', $day = 14 ) {
	$d = $type == 'post' ? 'get_post_time' : 'get_comment_time';
	if (time() - $d('U') > 60*60*24*$day) return;
	echo ' (', human_time_diff($d('U'), strtotime(current_time('mysql', 0))), '前)';
}

//评论样式
function theme_comment_list($comment, $args, $depth) {
	$GLOBALS['comment'] = $comment;
    global $commentcount,$wpdb, $post;
    if(!$commentcount) { //初始化楼层计数器
		$comments = $wpdb->get_results("SELECT * FROM $wpdb->comments WHERE comment_post_ID = $post->ID AND comment_type = '' AND comment_approved = '1' AND !comment_parent");
		$cnt = count($comments);//获取主评论总数量
		$page = get_query_var('cpage');//获取当前评论列表页码
		$cpp=get_option('comments_per_page');//获取每页评论显示数量
		if (ceil($cnt / $cpp) == 1 || ($page > 1 && $page  == ceil($cnt / $cpp))) {
			$commentcount = $cnt + 1;//如果评论只有1页或者是最后一页，初始值为主评论总数
		} else {
			$commentcount = $cpp * $page + 1;
		}
    }

	echo '<li '; comment_class(); echo ' id="comment-'.get_comment_ID().'">';
	//楼层
	if(!$parent_id = $comment->comment_parent) {
		echo '<div class="comment-floor"><a href="#comment-'.get_comment_ID().'">'; printf('#%1$s', --$commentcount); echo '</a></div>';
	}
	//头像
	echo '<div class="comment-avatar">';
	if (($comment->comment_author_email) == get_bloginfo ('admin_email')){
		echo '<img src="'.get_bloginfo('template_directory').'/img/admin.jpg" class="avatar" />';
	} else {
		echo get_avatar( $comment->comment_author_email, $size = '36' ,$default = get_bloginfo('template_directory') . '/img/default.png'); 
	}
	echo '</div>';
	//内容
	echo '<div class="comment-main" id="div-comment-'.get_comment_ID().'">';
		echo comment_text();
		if ($comment->comment_approved == '0'){
			echo '<span class="comment-approved">您的评论正在排队审核中，请稍后！</span><br />';
		}
		//信息
		echo '<div class="comment-meta">';
			echo '<span class="comment-author">'.get_comment_author_link().'</span>'; echo get_comment_time('m-d H:i '); echo time_ago(); 
			if ($comment->comment_approved !== '0'){ 
				echo comment_reply_link( array_merge( $args, array('add_below' => 'div-comment', 'depth' => $depth, 'max_depth' => $args['max_depth'] ) ) ); 
				echo edit_comment_link(__('(编辑)'),' - ','');
			} 
		echo '</div>';
	echo '</div>';
}

?>
