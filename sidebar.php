<div id="sidebar">
    <div id="related" class="widget stationary">
		<h3>相关图片</h3>
		<ul class="clearfix">
			<?php
				foreach(get_the_category() as $category){
					$cat = $category->cat_ID;
				}
				query_posts('cat=' . $cat . '&orderby=rand&showposts=9');
				while (have_posts()) : the_post();
				$output = preg_match('/<img.+src=[\'"]([^\'"]+)[\'"].*>/i', $post->post_content, $matches); 
				$imgnum = count($matches);
			?>
			<li>
			<?php if ( $imgnum > 0 ) {  ?>
			<a class="same_cat_posts_img" href="<?php the_permalink() ?>" title="<?php the_title(); ?>"><?php echo '<img src="'.get_bloginfo('template_url').'/timthumb.php?src='.$matches[1].'&amp;w=80&amp;h=80&amp;zc=1" />';?></a>
			<?php } else {  ?>
			<a class="same_cat_posts_img" href="<?php the_permalink() ?>" title="<?php the_title(); ?>"><img alt="<?php the_title(); ?>" src="<?php bloginfo('template_url'); ?>/timthumb.php?src=<?php bloginfo('template_url'); ?>/images/defaultphoto.png&amp;w=80&amp;h=80&amp;zc=1" /></a>
			<?php } ?>
			</li>
			<?php endwhile; wp_reset_query(); ?>
		</ul>
		<div class="clear"></div>
	</div><!-- #related END -->

    <div id="recent-comments">
        <h3>最新评论</h3>
        <ul>
<?php
    global $wpdb;
    $sql = "SELECT DISTINCT ID, post_title, post_password, comment_ID, comment_post_ID, comment_author, comment_date_gmt, comment_approved,comment_author_email, comment_type,comment_author_url, SUBSTRING(comment_content,1,40) AS com_excerpt FROM $wpdb->comments LEFT OUTER JOIN $wpdb->posts ON ($wpdb->comments.comment_post_ID = $wpdb->posts.ID) WHERE comment_approved = '1' AND comment_type = '' AND post_password = '' ORDER BY comment_date_gmt DESC LIMIT 10";
    $comments = $wpdb->get_results($sql);
    $output = "";
    foreach ( $comments as $comment ) {
        if (($comment->comment_author_email) == get_bloginfo ('admin_email')){
            $avatar = '<img src="'.get_bloginfo('template_directory').'/img/admin.jpg" class="avatar" />';
        } else {
            /*
                关于头像不显示的问题，请看下面这篇文章：
                http://farlee.info/archives/wordpress-comments-gravatar-reply-links.html
            */
            $avatar = get_avatar( $comment->comment_author_email, $size = '36', $default = get_bloginfo('template_directory') . '/img/default.png'); 
        }
        $output .= "\n<li><a href=\"" . get_permalink($comment->ID) . "#comment-" . $comment->comment_ID . "\" title=\"" . $comment->post_title . " 上的评论\">". $avatar ."<strong>". strip_tags($comment->comment_author) ."：</strong> ". strip_tags($comment->com_excerpt) ."</a></li>";
    }
    echo $output;
?>
        </ul>
    </div><!-- #recent-comments END -->
</div>
