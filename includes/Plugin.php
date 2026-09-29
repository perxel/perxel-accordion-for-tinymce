<?php

namespace Perxel_Accordion_For_Tinymce;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Boot: wire the shortcode and the TinyMCE editor button. Instantiated once
 * from the main file on plugins_loaded.
 */
class Plugin {

	/**
	 * @var Plugin|null
	 */
	private static $instance = null;

	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function boot() {
		( new Shortcode() )->register();
		( new Editor() )->register();
	}
}
