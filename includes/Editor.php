<?php

namespace Perxel_Tinymce_Accordion;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the "Insert Accordion" button with the classic TinyMCE editor.
 * Global by design, so ACF WYSIWYG fields set to "Toolbar: Full" and widget
 * editors pick it up along with the main post editor.
 */
class Editor {

	public function register() {
		add_filter( 'mce_buttons', array( $this, 'add_button' ) );
		add_filter( 'mce_external_plugins', array( $this, 'add_plugin' ) );
		add_filter( 'mce_css', array( $this, 'add_editor_css' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_editor_assets' ) );
	}

	/**
	 * Loads the accordion stylesheet inside the TinyMCE iframe, so the
	 * wp.mce.views preview is styled exactly like the front end. The insert
	 * dialog's nested editor reuses `content_css`, so it gets it too.
	 *
	 * @param string $mce_css Comma-separated stylesheet URLs.
	 * @return string
	 */
	public function add_editor_css( $mce_css ) {
		if ( ! Shortcode::load_css() ) {
			return $mce_css;
		}

		$url = add_query_arg( 'ver', Shortcode::css_version(), PXTA_URL . '/' . Shortcode::CSS );

		return $mce_css ? $mce_css . ',' . $url : $url;
	}

	/**
	 * The dialog's content field is a nested instance built with
	 * `wp.editor.initialize()`, so it renders as a real (mini) classic
	 * editor - same skin, same Visual/Code tabs - rather than a bare
	 * textarea. `wp.editor.initialize()` needs the scripts this enqueues;
	 * most screens that already show our button have them, but this
	 * guarantees it for contexts (e.g. some ACF field setups) that don't.
	 */
	public function enqueue_editor_assets() {
		if ( ! current_user_can( 'edit_posts' ) && ! current_user_can( 'edit_pages' ) ) {
			return;
		}

		wp_enqueue_editor();

		$css = PXTA_DIR . '/assets/css/pxta-admin.css';

		wp_enqueue_style(
			'pxta-accordion-admin',
			PXTA_URL . '/assets/css/pxta-admin.css',
			array(),
			file_exists( $css ) ? (string) filemtime( $css ) : PXTA_VERSION
		);
	}

	/**
	 * @param string[] $buttons Existing toolbar buttons.
	 * @return string[]
	 */
	public function add_button( $buttons ) {
		if ( ! current_user_can( 'edit_posts' ) && ! current_user_can( 'edit_pages' ) ) {
			return $buttons;
		}

		$buttons[] = 'pxta_accordion';

		return $buttons;
	}

	/**
	 * @param string[] $plugins Existing external TinyMCE plugins, keyed by name.
	 * @return string[]
	 */
	public function add_plugin( $plugins ) {
		if ( ! current_user_can( 'edit_posts' ) && ! current_user_can( 'edit_pages' ) ) {
			return $plugins;
		}

		$js = PXTA_DIR . '/assets/js/editor.js';

		$plugins['pxta_accordion'] = add_query_arg(
			'ver',
			file_exists( $js ) ? (string) filemtime( $js ) : PXTA_VERSION,
			PXTA_URL . '/assets/js/editor.js'
		);

		return $plugins;
	}
}
