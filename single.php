<?php
/**
 * The template for displaying all pages.
 */

get_header(); ?>

<?php
    the_post();
    $category = get_the_category();
    $date = explode(' ', $post->post_date);
 ?>

<div id="single" class="clearfix">

    <div id="section" id="post-<?php the_ID();?>">

        <div class="header">
            <h3 class="title"><?php the_title(); ?></h3>
            <div class="attribute">
                <span class="author"><?php the_author(); ?></span><i>/</i>
                <span class="category"><?php echo $category[0]->name; ?></span><i>/</i>
                <span class="date"><?php echo $date[0] ?></span>
            </div>
        </div>

        <div class="content"><?php the_content(); ?></div>

        <?php comments_template(); ?> 

    </div>
    
    <?php get_sidebar(); ?>

</div><!-- #single END -->

<?php get_footer(); ?>
