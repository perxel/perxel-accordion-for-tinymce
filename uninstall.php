<?php
/**
 * Uninstall cleanup. Runs only when the plugin is deleted from the Plugins
 * screen.
 *
 * @package Perxel_Accordion_For_Tinymce
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/*
 * This plugin stores no options and creates no custom tables - it registers a
 * shortcode and a TinyMCE button, both removed with the plugin files
 * themselves. Nothing to clean up here.
 */
