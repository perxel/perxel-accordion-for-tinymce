<?php
/**
 * Plugin Name:       Perxel TinyMCE Accordion
 * Plugin URI:        https://perxel.com/products/perxel-tinymce-accordion
 * Description:       Adds an "Insert Accordion" button to the classic TinyMCE editor and renders it on the front end as an accessible accordion.
 * Version:           0.0.6
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            Perxel
 * Author URI:        https://perxel.com/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       perxel-tinymce-accordion
 *
 * @package Perxel_Tinymce_Accordion
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PXTA_VERSION', '0.0.6' );
define( 'PXTA_FILE', __FILE__ );
define( 'PXTA_DIR', __DIR__ );
define( 'PXTA_URL', untrailingslashit( plugin_dir_url( __FILE__ ) ) );

/**
 * Human-readable product name. A brand name, deliberately not translated.
 */
define( 'PXTA_NAME', 'Perxel TinyMCE Accordion' );

/**
 * PSR-4-ish autoloader for Perxel_Tinymce_Accordion\* -> includes/*.php. The
 * namespace root matches the slug (perxel-tinymce-accordion ->
 * Perxel_Tinymce_Accordion) so WordPress Plugin Check accepts it as the
 * plugin prefix with no suppression.
 */
spl_autoload_register(
	static function ( $class_name ) {
		if ( strpos( $class_name, 'Perxel_Tinymce_Accordion\\' ) !== 0 ) {
			return;
		}

		$relative = substr( $class_name, strlen( 'Perxel_Tinymce_Accordion\\' ) );
		$path     = PXTA_DIR . '/includes/' . str_replace( '\\', '/', $relative ) . '.php';

		if ( is_readable( $path ) ) {
			require $path;
		}
	}
);

add_action(
	'plugins_loaded',
	static function () {
		// Translations for a wordpress.org-hosted plugin load automatically since
		// WP 4.6 - no load_plugin_textdomain() call needed.
		Perxel_Tinymce_Accordion\Plugin::instance()->boot();
	}
);
