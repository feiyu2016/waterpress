<div id="comments">
    <?php if ( have_comments() ) : ?>
    <h3 class="comment-title">访客评论</h3>

    <ol class="comment-list">
        <?php 
            /*
                http://farlee.info/archives/wordpress-comments-gravatar-reply-links.html
            */
            wp_list_comments('type=comment&callback=theme_comment_list');
            // wp_list_comments();
        ?>
    </ol>
    <?php endif; ?>

<?php
    $commenter = wp_get_current_commenter();
    $fields = array(
        'author' => '<label for="author">'. __( '签名' ) .'</label><input id="author" name="author" type="text" value="'. esc_attr( $commenter['comment_author'] ) .'" size="30" /><i class="required">*</i>',
        'email' => '<label for="email">'. __( '邮箱' ) .'</label><input id="email" name="email" type="text" value="'. esc_attr(  $commenter['comment_author_email'] ) .'" size="30" /><i class="required">*</i>',
        'url' => '<label for="url">'. __( '网址' ) .'</label><input id="url" name="url" type="text" value="'. esc_attr( $commenter['comment_author_url'] ) .'" size="30" />'
    );

    // $text = '<div class="comment-form-comment"><p><label for="comment">' . __( '发表评论：' ) . '</label><textarea id="comment" name="comment" cols="45" rows="8" aria-required="true"></textarea></p></div>';
    $text = '<div class="comment-form-comment"><textarea id="comment" name="comment" cols="45" rows="8" aria-required="true"></textarea></div>';

    //apply_filters('comment_form_default_fields', 'wf_fields');
    comment_form(array('fields' => $fields, 'comment_field' => $text));
?>
</div>
