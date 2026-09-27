/* global tinymce, wp, quicktags */
/**
 * Classic TinyMCE plugin: adds the "Insert Accordion" toolbar button, a
 * title/content dialog, and registers a wp.mce.views live preview for the
 * [pxta_accordion] shortcode in the Visual tab. The Text tab needs nothing
 * extra - it always shows the raw shortcode.
 */
( function ( tinymce, wp ) {
	'use strict';

	var SHORTCODE = 'pxta_accordion';
	var CONTENT_FIELD_ID = 'pxta-accordion-content';

	// tabler-icons "layout-bottombar-collapse", filled with Perxel blue (#2271B1).
	var BUTTON_ICON =
		'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMjI3MUIxIiBjbGFzcz0iaWNvbiBpY29uLXRhYmxlciBpY29ucy10YWJsZXItZmlsbGVkIGljb24tdGFibGVyLWxheW91dC1ib3R0b21iYXItY29sbGFwc2UiPjxwYXRoIHN0cm9rZT0ibm9uZSIgZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIgLz48cGF0aCBkPSJNMTggM2EzIDMgMCAwIDEgMi45OTUgMi44MjRsLjAwNSAuMTc2djEyYTMgMyAwIDAgMSAtMi44MjQgMi45OTVsLS4xNzYgLjAwNWgtMTJhMyAzIDAgMCAxIC0yLjk5NSAtMi44MjRsLS4wMDUgLS4xNzZ2LTEyYTMgMyAwIDAgMSAyLjgyNCAtMi45OTVsLjE3NiAtLjAwNWgxMnptMCAyaC0xMmExIDEgMCAwIDAgLS45OTMgLjg4M2wtLjAwNyAuMTE3djloMTR2LTlhMSAxIDAgMCAwIC0uODgzIC0uOTkzbC0uMTE3IC0uMDA3em0tNy4zODcgMy4yMWwuMDk0IC4wODNsMS4yOTMgMS4yOTJsMS4yOTMgLTEuMjkyYTEgMSAwIDAgMSAxLjMyIC0uMDgzbC4wOTQgLjA4M2ExIDEgMCAwIDEgLjA4MyAxLjMybC0uMDgzIC4wOTRsLTIgMmExIDEgMCAwIDEgLTEuMzIgLjA4M2wtLjA5NCAtLjA4M2wtMiAtMmExIDEgMCAwIDEgMS4zMiAtMS40OTd6IiAvPjwvc3ZnPg==';

	tinymce.PluginManager.add( 'pxta_accordion', function ( editor ) {
		editor.addButton( SHORTCODE, {
			title: 'Insert Accordion',
			text: 'Accordion',
			icon: false,
			image: BUTTON_ICON,
			onclick: function () {
				var selection = editor.selection.getContent( { format: 'raw' } );

				editor.windowManager.open( {
					title: 'Insert Accordion',
					body: [
						{
							type: 'textbox',
							name: 'title',
							label: 'Title',
						},
						{
							type: 'textbox',
							name: 'content',
							label: 'Content',
							multiline: true,
							minHeight: 150,
							value: selection,
							onPostRender: function () {
								var textarea = this.getEl();
								textarea.id = CONTENT_FIELD_ID;

								if ( typeof quicktags === 'function' ) {
									quicktags( {
										id: CONTENT_FIELD_ID,
										buttons: 'strong,em,link,ul,ol,li,close',
									} );
								}
							},
						},
					],
					onsubmit: function ( e ) {
						var title = e.data.title || '';
						var content = e.data.content || '';

						editor.insertContent(
							'[' + SHORTCODE + ' title="' + tinymce.DOM.encode( title ) + '"]' +
								content +
								'[/' + SHORTCODE + ']'
						);
					},
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
				var title = this.shortcode.attrs.named.title || '';

				return (
					'<details class="pxta-accordion" open>' +
					'<summary>' + tinymce.DOM.encode( title ) + '</summary>' +
					'<div class="pxta-accordion__content">' + this.shortcode.content + '</div>' +
					'</details>'
				);
			},
		} );
	}
} )( window.tinymce, window.wp );
