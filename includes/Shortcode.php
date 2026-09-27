<?php

namespace Perxel_Tinymce_Accordion;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The [pxta_accordion] shortcode: a WAI-ARIA accordion (heading > button
 * trigger + content region), plus its front-end stylesheet and script.
 */
class Shortcode {

	const TAG = 'pxta_accordion';

	/**
	 * The default accordion stylesheet, relative to the plugin root. Loaded
	 * on the front end and inside the classic editor (see Editor::add_editor_css()),
	 * so the Visual tab preview matches the published page.
	 */
	const CSS = 'assets/css/pxta-accordion.css';

	/**
	 * Front-end script that opens/closes accordions (aria-expanded, hidden,
	 * pxta-accordion--open). Enqueued only when an accordion renders.
	 */
	const JS = 'assets/js/pxta-accordion.js';

	/**
	 * Tags the element wrapping the trigger button may use (the title_tag
	 * attribute); keep in sync with TITLE_TAGS in assets/js/editor.js.
	 */
	const TITLE_TAGS = array( 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );

	const DEFAULT_TITLE_TAG = 'div';

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
		$atts = shortcode_atts(
			array(
				'title'     => '',
				'title_tag' => self::DEFAULT_TITLE_TAG,
				'open'      => '',
			),
			$atts,
			self::TAG
		);

		$tag = strtolower( (string) $atts['title_tag'] );

		if ( ! in_array( $tag, self::TITLE_TAGS, true ) ) {
			$tag = self::DEFAULT_TITLE_TAG;
		}

		$open = in_array( strtolower( (string) $atts['open'] ), array( '1', 'true', 'yes' ), true );
		$id   = wp_unique_id( 'pxta-accordion-' );

		wp_enqueue_script( 'pxta-accordion', PXTA_URL . '/' . self::JS, array(), self::asset_version( self::JS ), true );

		$html = sprintf(
			'<div class="%1$s"><div class="pxta-accordion-inner">' .
			'<%2$s class="pxta-accordion__heading"><button type="button" class="pxta-accordion__trigger" id="%3$s-trigger" aria-expanded="%4$s" aria-controls="%3$s-content">' .
			'<span class="pxta-accordion__title">%5$s</span><span class="pxta-accordion__icon" aria-hidden="true"></span></button></%2$s>' .
			'<div class="pxta-accordion__content" id="%3$s-content" role="region" aria-labelledby="%3$s-trigger"%6$s><div class="pxta-accordion__content-inner">%7$s</div></div>' .
			'</div></div>',
			esc_attr( $open ? 'pxta-accordion pxta-accordion--open' : 'pxta-accordion' ),
			tag_escape( $tag ),
			esc_attr( $id ),
			$open ? 'true' : 'false',
			esc_html( $atts['title'] ),
			$open ? '' : ' hidden',
			self::clean_content( do_shortcode( (string) $content ) )
		);

		/**
		 * Filter the accordion's rendered HTML. Return your own markup to
		 * replace it entirely.
		 *
		 * @param string      $html    The rendered accordion markup.
		 * @param array       $atts    Shortcode attributes (with defaults applied).
		 * @param string|null $content Raw shortcode inner content.
		 */
		return apply_filters( 'pxta_accordion_html', $html, $atts, $content );
	}

	/**
	 * Undo wpautop's damage around the shortcode tags. wpautop (the_content,
	 * priority 10) runs before shortcodes (priority 11), so the content arrives
	 * as "</p>\n<p>...</p>\n<p>" - the stray edge tags become empty paragraphs
	 * in the browser. Strip those, then any empty <p> left inside.
	 *
	 * @param string $html Rendered inner content.
	 * @return string
	 */
	private static function clean_content( $html ) {
		$html = preg_replace( '#^\s*(?:</p>|<br\s*/?>)\s*#i', '', $html );
		$html = preg_replace( '#\s*(?:<p>|<br\s*/?>)\s*$#i', '', $html );
		$html = preg_replace( '#<p>(?:\s|&nbsp;|&\#160;|<br\s*/?>)*</p>\s*#i', '', $html );

		return trim( $html );
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
		return self::asset_version( self::CSS );
	}

	/**
	 * @param string $path Asset path relative to the plugin root.
	 * @return string
	 */
	private static function asset_version( $path ) {
		$file = PXTA_DIR . '/' . $path;

		return file_exists( $file ) ? (string) filemtime( $file ) : PXTA_VERSION;
	}
}
