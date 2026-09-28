/* global tinymce, wp */
/**
 * Classic TinyMCE plugin: adds the "Insert Accordion" toolbar button, a
 * dialog (title, title tag, "Open by default", content), and registers a
 * wp.mce.views live preview for the [pxta_accordion] shortcode in the Visual
 * tab. The Text tab needs nothing extra - it always shows the raw shortcode.
 *
 * Shortcode written by this file:
 *   [pxta_accordion title="..." title_tag="h3" open="1"]content[/pxta_accordion]
 * title_tag is omitted when it is the default (div), open when unchecked
 * (collapsed). Shortcode.php renders the same markup as previewHtml() below.
 */
( function ( tinymce, wp ) {
	'use strict';

	var SHORTCODE = 'pxta_accordion';
	var CONTENT_EDITOR_ID = 'pxta-accordion-content';
	var DIALOG_MAX_WIDTH = 900;
	var DIALOG_CHROME_HEIGHT = 100;
	var CONTENT_MIN_HEIGHT = 100;
	var CONTENT_BOTTOM_GAP = 15;
	var WRAPPER_CLASS = 'pxta-accordion-dialog';
	var BODY_OPEN_CLASS = 'pxta-accordion-dialog-open';

	// Tags the element wrapping the trigger button may use; keep in sync with
	// Shortcode::TITLE_TAGS and Shortcode::DEFAULT_TITLE_TAG.
	var TITLE_TAGS = [ 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
	var DEFAULT_TITLE_TAG = 'div';

	// Preview elements need unique ids for aria-controls/aria-labelledby.
	var previewCount = 0;

	// tabler-icons "layout-bottombar-collapse", filled with Perxel blue (#2271B1).
	var BUTTON_ICON =
		'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMjI3MUIxIiBjbGFzcz0iaWNvbiBpY29uLXRhYmxlciBpY29ucy10YWJsZXItZmlsbGVkIGljb24tdGFibGVyLWxheW91dC1ib3R0b21iYXItY29sbGFwc2UiPjxwYXRoIHN0cm9rZT0ibm9uZSIgZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIgLz48cGF0aCBkPSJNMTggM2EzIDMgMCAwIDEgMi45OTUgMi44MjRsLjAwNSAuMTc2djEyYTMgMyAwIDAgMSAtMi44MjQgMi45OTVsLS4xNzYgLjAwNWgtMTJhMyAzIDAgMCAxIC0yLjk5NSAtMi44MjRsLS4wMDUgLS4xNzZ2LTEyYTMgMyAwIDAgMSAyLjgyNCAtMi45OTVsLjE3NiAtLjAwNWgxMnptMCAyaC0xMmExIDEgMCAwIDAgLS45OTMgLjg4M2wtLjAwNyAuMTE3djloMTR2LTlhMSAxIDAgMCAwIC0uODgzIC0uOTkzbC0uMTE3IC0uMDA3em0tNy4zODcgMy4yMWwuMDk0IC4wODNsMS4yOTMgMS4yOTJsMS4yOTMgLTEuMjkyYTEgMSAwIDAgMSAxLjMyIC0uMDgzbC4wOTQgLjA4M2ExIDEgMCAwIDEgLjA4MyAxLjMybC0uMDgzIC4wOTRsLTIgMmExIDEgMCAwIDEgLTEuMzIgLjA4M2wtLjA5NCAtLjA4M2wtMiAtMmExIDEgMCAwIDEgMS4zMiAtMS40OTd6IiAvPjwvc3ZnPg==';

	/**
	 * The accordion's settings as the dialog edits them.
	 *
	 * @typedef {Object} AccordionValues
	 * @property {string}  title
	 * @property {string}  titleTag One of TITLE_TAGS.
	 * @property {boolean} open     Open on page load (the front end only; the preview is always open).
	 * @property {string}  content  Inner HTML.
	 */

	/**
	 * @param {string} tag
	 * @return {string} The tag if it is allowed, otherwise DEFAULT_TITLE_TAG.
	 */
	function sanitizeTitleTag( tag ) {
		tag = String( tag || '' ).toLowerCase();

		return TITLE_TAGS.indexOf( tag ) === -1 ? DEFAULT_TITLE_TAG : tag;
	}

	/**
	 * Reads a shortcode's attributes and content into dialog values.
	 * Mirrors the truthy values Shortcode::render() accepts for `open`.
	 *
	 * @param {wp.shortcode} shortcode
	 * @return {AccordionValues}
	 */
	function valuesFromShortcode( shortcode ) {
		var attrs = shortcode.attrs.named;

		return {
			title: attrs.title || '',
			titleTag: sanitizeTitleTag( attrs.title_tag ),
			open: [ '1', 'true', 'yes' ].indexOf( String( attrs.open || '' ).toLowerCase() ) !== -1,
			content: shortcode.content || '',
		};
	}

	/**
	 * Builds the [pxta_accordion] shortcode. Default values (div tag,
	 * collapsed) are left out to keep the Text tab tidy.
	 *
	 * @param {AccordionValues} values
	 * @return {string}
	 */
	function buildShortcode( values ) {
		var tag = sanitizeTitleTag( values.titleTag );

		return (
			'[' + SHORTCODE + ' title="' + tinymce.DOM.encode( values.title ) + '"' +
			( tag !== DEFAULT_TITLE_TAG ? ' title_tag="' + tag + '"' : '' ) +
			( values.open ? ' open="1"' : '' ) + ']' +
			values.content +
			'[/' + SHORTCODE + ']'
		);
	}

	/**
	 * The Visual tab preview: the same markup Shortcode::render() outputs on
	 * the front end, but always open so the content can be read while editing
	 * (the "Open by default" setting only affects the published page).
	 *
	 * @param {AccordionValues} values
	 * @return {string}
	 */
	function previewHtml( values ) {
		var tag = sanitizeTitleTag( values.titleTag );
		var id = 'pxta-accordion-preview-' + ( ++previewCount );

		return (
			'<div class="pxta-accordion pxta-accordion--open"><div class="pxta-accordion-inner">' +
			'<' + tag + ' class="pxta-accordion__heading">' +
			'<button type="button" class="pxta-accordion__trigger" id="' + id + '-trigger" aria-expanded="true" aria-controls="' + id + '-content">' +
			'<span class="pxta-accordion__title">' + tinymce.DOM.encode( values.title ) + '</span>' +
			'<span class="pxta-accordion__icon" aria-hidden="true"></span>' +
			'</button></' + tag + '>' +
			'<div class="pxta-accordion__content" id="' + id + '-content" role="region" aria-labelledby="' + id + '-trigger">' +
			'<div class="pxta-accordion__content-inner">' + values.content + '</div></div>' +
			'</div></div>'
		);
	}

	/**
	 * Fills the viewport, capped at DIALOG_MAX_WIDTH. TinyMCE adds the header
	 * and footer on top of the height passed to windowManager.open(), so
	 * DIALOG_CHROME_HEIGHT is subtracted here to keep the footer on screen.
	 */
	function dialogSize() {
		var margin = window.innerHeight < 600 ? 10 : 30;

		return {
			width: Math.min( DIALOG_MAX_WIDTH, window.innerWidth - 2 * margin ),
			height: Math.max( 120, window.innerHeight - 2 * margin - DIALOG_CHROME_HEIGHT ),
		};
	}

	/**
	 * Shrinks or grows the nested editor's iframe so the dialog body is
	 * filled without overflowing; the body still scrolls if even the minimum
	 * height does not fit.
	 *
	 * @param {tinymce.ui.Window} win
	 */
	function fitContentEditor( win ) {
		var nested = tinymce.get( CONTENT_EDITOR_ID );
		var body = win.getEl( 'body' );
		var wrap = document.getElementById( 'wp-' + CONTENT_EDITOR_ID + '-wrap' );

		if ( ! nested || ! nested.iframeElement || ! body || ! wrap ) {
			return;
		}

		var iframe = nested.iframeElement;
		var bodyRect = body.getBoundingClientRect();

		// The window opens with a scale(.1) -> scale(1) CSS transition, and
		// getBoundingClientRect() reports transformed sizes, so undo the scale.
		var scale = bodyRect.height / body.offsetHeight || 1;
		var wrapBottom = ( wrap.getBoundingClientRect().bottom - bodyRect.top ) / scale + body.scrollTop;
		var free = body.clientHeight - wrapBottom - CONTENT_BOTTOM_GAP;

		iframe.style.height = Math.max( CONTENT_MIN_HEIGHT, iframe.offsetHeight + free ) + 'px';
	}

	/**
	 * Adds the table button to the nested editor's settings when the host
	 * editor has a `table` plugin (TinyMCE Advanced, a theme, ...). WordPress
	 * core does not bundle one, so nothing is added when it is missing.
	 *
	 * @param {tinymce.Editor} editor   Host editor.
	 * @param {Object}         settings Nested editor's tinymce settings, mutated.
	 */
	function addTableSupport( editor, settings ) {
		var hostPlugins = editor.settings.plugins || '';
		var external = {};
		var hasTable = ( tinymce.PluginManager.lookup && tinymce.PluginManager.lookup.table ) ||
			/(^|[\s,])table([\s,]|$)/.test( hostPlugins );

		if ( ! hasTable ) {
			return;
		}

		// Reuse the host's plugin list so `table` resolves the same way, but never
		// nest this plugin's own button inside the dialog.
		settings.plugins = ( Array.isArray( hostPlugins ) ? hostPlugins.join( ' ' ) : hostPlugins )
			.split( /[\s,]+/ )
			.filter( function ( name ) {
				return name && name !== 'pxta_accordion';
			} )
			.join( ' ' );

		Object.keys( editor.settings.external_plugins || {} ).forEach( function ( name ) {
			if ( name !== 'pxta_accordion' ) {
				external[ name ] = editor.settings.external_plugins[ name ];
			}
		} );
		settings.external_plugins = external;

		if ( ! /(^|[\s,])table([\s,]|$)/.test( settings.plugins ) ) {
			settings.plugins += ' table';
		}
		settings.toolbar1 += ',table';
	}

	/**
	 * Opens the accordion dialog, pre-filled with the given values, and calls
	 * onSave( values ) when the user confirms. Shared by the insert button and
	 * the Visual tab preview's edit action, so editing an existing accordion
	 * reopens the same dialog.
	 *
	 * The content field is a nested editor built with wp.editor.initialize(),
	 * the same API WordPress itself uses for dynamically-added editors (e.g.
	 * ACF's WYSIWYG field). That gets us the real classic-editor chrome - WP
	 * skin, toolbar, and native Visual/Code tabs - for free, instead of a
	 * bare textarea or a hand-rolled tab toggle.
	 *
	 * @param {tinymce.Editor}  editor
	 * @param {AccordionValues} initial
	 * @param {Function}        onSave
	 */
	function openAccordionDialog( editor, initial, onSave ) {
		var size = dialogSize();
		var win;

		function onResize() {
			var next = dialogSize();
			var rect = win.layoutRect();
			var outerHeight = next.height + ( rect.h - rect.innerH );

			win.resizeTo( next.width, outerHeight );
			win.moveTo(
				Math.max( 0, ( window.innerWidth - next.width ) / 2 ),
				Math.max( 0, ( window.innerHeight - outerHeight ) / 2 )
			);
			fitContentEditor( win );
		}

		win = editor.windowManager.open( {
			title: 'Insert Accordion',
			width: size.width,
			height: size.height,
			body: [
				{
					type: 'textbox',
					name: 'title',
					label: 'Title',
					value: initial.title,
				},
				{
					type: 'listbox',
					name: 'title_tag',
					label: 'Title tag',
					value: sanitizeTitleTag( initial.titleTag ),
					values: TITLE_TAGS.map( function ( tag ) {
						return { text: tag === DEFAULT_TITLE_TAG ? tag + ' (default)' : tag, value: tag };
					} ),
				},
				{
					// Front end only: unchecked renders the accordion collapsed.
					// The Visual tab preview is always open.
					type: 'checkbox',
					name: 'open',
					label: 'Open by default',
					checked: initial.open,
				},
				{
					type: 'label',
					text: 'Content',
				},
				{
					type: 'container',
					style: 'display: block; width: 100%;',
					html: '<textarea id="' + CONTENT_EDITOR_ID + '" style="width: 100%;"></textarea>',
					onPostRender: function () {
						var textarea = document.getElementById( CONTENT_EDITOR_ID );
						textarea.value = initial.content;

						var tinymceSettings = {
							menubar: false,
							statusbar: false,
							toolbar1: 'bold,italic,bullist,numlist,link,unlink,undo,redo',
							// No `plugins` override (except addTableSupport() below):
							// wp.editor's defaults include the "wordpress" plugin, which
							// adds the mceContentBody/wp-editor body classes that core and
							// theme editor styles are scoped to.
							height: CONTENT_MIN_HEIGHT,
							// Inherit the host editor's styles (theme add_editor_style()
							// etc.); wp.editor's defaults only carry core's stylesheets.
							content_css: editor.settings.content_css,
							body_class: editor.settings.body_class,
							init_instance_callback: function () {
								fitContentEditor( win );
							},
						};

						addTableSupport( editor, tinymceSettings );

						wp.editor.initialize( CONTENT_EDITOR_ID, {
							tinymce: tinymceSettings,
							quicktags: {
								buttons: 'strong,em,link,ul,ol,li,close',
							},
							mediaButtons: false,
						} );
					},
				},
			],
			onsubmit: function ( e ) {
				var content = wp.editor.getContent( CONTENT_EDITOR_ID );

				onSave( {
					title: e.data.title || '',
					titleTag: e.data.title_tag,
					open: !! e.data.open,
					content: content == null ? initial.content : content,
				} );
			},
			onclose: function () {
				window.removeEventListener( 'resize', onResize );
				wp.editor.remove( CONTENT_EDITOR_ID );
			},
		} );

		// TinyMCE re-renders the window's own class list, so the wrapper
		// class goes on the inner .mce-reset element, which it never touches.
		win.getEl().firstChild.classList.add( WRAPPER_CLASS );
		// Lets pxta-admin.css lift the link popup (appended to <body>) above the dialog.
		document.body.classList.add( BODY_OPEN_CLASS );
		window.addEventListener( 'resize', onResize );
	}

	tinymce.PluginManager.add( 'pxta_accordion', function ( editor ) {
		editor.addButton( SHORTCODE, {
			title: 'Insert Accordion',
			text: 'Accordion',
			icon: false,
			image: BUTTON_ICON,
			onclick: function () {
				var selection = editor.selection.getContent( { format: 'raw' } );

				var initial = { title: '', titleTag: DEFAULT_TITLE_TAG, open: false, content: selection };

				openAccordionDialog( editor, initial, function ( values ) {
					editor.insertContent( buildShortcode( values ) );
				} );
			},
		} );
	} );

	if ( wp && wp.mce && wp.mce.views && wp.mce.views.register ) {
		wp.mce.views.register( SHORTCODE, {
			initialize: function () {
				this.render( this.getHtml() );
			},
			getHtml: function () {
				return previewHtml( valuesFromShortcode( this.shortcode ) );
			},
			edit: function ( text, update ) {
				openAccordionDialog( tinymce.activeEditor, valuesFromShortcode( this.shortcode ), function ( values ) {
					update( buildShortcode( values ) );
				} );
			},
		} );
	}
} )( window.tinymce, window.wp );
