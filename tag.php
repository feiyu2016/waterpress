<?php
/**
 * The template for displaying tag.
 */
?>

<?php if ( !array_key_exists('postsNum', $_GET) ) : ?>

    <?php get_header(); ?>
    <div id="loading">加 载 中 ...</div>
    <div id="container">
        <div id="tag-cloud">
            <?php wp_tag_cloud('smallest=13&largest=13&unit=px'); ?>
        </div>
    </div>
    <div id="more"><span> 查 看 更 多 >> </span></div>
    <script id="tpl" type="text/template">
        <div class="item" id="item-${id}" style="top:${top}px;left:${left}px;">
           <div class="title"><a href="${href}" target="_blank">${title}</a></div>
           <div class="image"><a href="${href}" target="_blank"><img width="190" height="${height}" src="${image}" alt="${title}" /></a></div>
           <div class="excerpt">${excerpt}</div>
           <div class="attr"><a class="category" href="">${category}</a> / <a class="comments" href="">${comments} COMMENTS</a></div>
        </div>
    </script>
    <?php get_footer(); ?>

<?php else : ?>

    <?php
        // header('Content-type: text/json');
        $doc_root = $_SERVER['DOCUMENT_ROOT'];
        $posts_num = $_GET['postsNum'];
        $tag = array_key_exists('tag', $_GET) ? $_GET['tag'] : -1;
        $json = array();

        query_posts('tag='. $tag .'&showposts='. $posts_num);
        if ( have_posts() ) {
            while ( have_posts() ) : the_post();

                $image_url = get_first_image();

                if ( $image_url ) {

                    $image_path = parse_url($image_url);
                    $image_size = getimagesize($doc_root . $image_path['path']);
                    $height = floor(190 / $image_size[0] * $image_size[1]);

                    $category = get_the_category();

                    $item = array(
                        "href"=>$post->guid,
                        "image"=>get_bloginfo('template_url') .'/timthumb.php?src='. $image_url .'&w=190&zc=1',
                        "title"=>$post->post_title,
                        "height"=>$height,
                        "excerpt"=>$post->post_excerpt,
                        "category"=>$category[0]->name,
                        "comments"=>$post->comment_count
                    ); 
                    array_push($json, $item);
                }
            endwhile;
            echo json_encode($json);
        }
    ?>

<?php endif; ?>
