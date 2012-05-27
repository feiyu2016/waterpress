<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title><?php bloginfo( 'name' ); ?></title>
<link rel="stylesheet" type="text/css" href="<?php bloginfo( 'stylesheet_url' ); ?>">
<script src="<?php echo get_template_directory_uri(); ?>/js/jquery.min.js"></script>
</head>
<body>
<div id="header">
    <div class="inner clearfix">
		<?php $heading_tag = ( is_home() ) ? 'h1' : 'div'; ?>
	    <<?php echo $heading_tag; ?> id="site-title">
            <a href="<?php echo home_url( '/' ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a>
	    </<?php echo $heading_tag; ?>>
        <?php wp_nav_menu(); ?>
		<ul id="login">
			<li><?php wp_loginout(); ?></li>
			<?php wp_register(); ?>
		</ul>
    </div>
</div>
