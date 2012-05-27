<?php get_header();
?>
<div id="error404">
	<h2>抱歉，沒有找到您需要的图片！！</h2>
	<h3>你可能喜欢：</h3>
	<ul class="clearfix">
		<?php
			foreach(get_the_category() as $category){
				$cat = $category->cat_ID;
			}
			query_posts('cat=' . $cat . '&orderby=rand&showposts=8');
			while (have_posts()) : the_post();
			$output = preg_match('/<img.+src=[\'"]([^\'"]+)[\'"].*>/i', $post->post_content, $matches); 
			$imgnum = count($matches);
		?>
		<li>
		<?php if ( $imgnum > 0 ) {  ?>
		<a class="same_cat_posts_img" href="<?php the_permalink() ?>" title="<?php the_title(); ?>"><?php echo '<img src="'.get_bloginfo('template_url').'/timthumb.php?src='.$matches[1].'&amp;w=120&amp;h=120&amp;zc=1" />';?></a>
		<?php } else {  ?>
		<a class="same_cat_posts_img" href="<?php the_permalink() ?>" title="<?php the_title(); ?>"><img alt="<?php the_title(); ?>" src="<?php bloginfo('template_url'); ?>/timthumb.php?src=<?php bloginfo('template_url'); ?>/img/defaultphoto.png&amp;w=120&amp;h=120&amp;zc=1" /></a>
		<?php } ?>
		</li>
		<?php endwhile; wp_reset_query(); ?>
	</ul>
</div>
<?php get_footer(); ?>
