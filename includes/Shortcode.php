<?php

namespace Perxel_Tinymce_Accordion;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The [pxta_accordion] shortcode: a native <details>/<summary> accordion,
 * plus the default front-end stylesheet.
 */
class Shortcode {

	const TAG = 'pxta_accordion';

	/**
	 * The default accordion stylesheet, relative to the plugin root. Loaded
	 * on the front end and inside the classic editor (see Editor::add_editor_css()),
	 * so the Visual tab preview matches the published page.
	 */
	const CSS = 'assets/css/accordion.css';

	public function register() {
		add_shortcode( self::TAG, array( $this, 'render' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'assets' ) );
	}

	/**
	 * @param array|string $atts    Shortcode attributes.
	 * @param string|null  $content Shortcode inner content.
	 * @return string
	 */
	public function render( $atts, $content = null ) {
		$atts = shortcode_atts( array( 'title' => '' ), $atts, self::TAG );

		$html = sprintf(
			'<details class="pxta-accordion"><summary>%s</summary><div class="pxta-accordion__content">%s</div></details>',
			esc_html( $atts['title'] ),
			do_shortcode( (string) $content )
		);

		/**
		 * Filter the accordion's rendered HTML. Return your own markup to
		 * replace it entirely.
		 *
		 * @param string      $html    The rendered <details> markup.
		 * @param array       $atts    Shortcode attributes (with defaults applied).
		 * @param string|null $content Raw shortcode inner content.
		 */
		return apply_filters( 'pxta_accordion_html', $html, $atts, $content );
	}

	public function assets() {
		if ( ! self::load_css() ) {
			return;
		}

		wp_enqueue_style( 'pxta-accordion', PXTA_URL . '/' . self::CSS, array(), self::css_version() );
	}

	/**
	 * Whether to load the default stylesheet, on the front end and in the editor.
	 *
	 * @return bool
	 */
	public static function load_css() {
		/**
		 * Whether to load the plugin's default accordion stylesheet (front end
		 * and editor). Return false to style the accordion entirely from the
		 * theme.
		 *
		 * @param bool $load_css Whether to load the default stylesheet.
		 */
		return (bool) apply_filters( 'pxta_accordion_load_css', true );
	}

	/**
	 * @return string
	 */
	public static function css_version() {
		$css = PXTA_DIR . '/' . self::CSS;

		return file_exists( $css ) ? (string) filemtime( $css ) : PXTA_VERSION;
	}
}
