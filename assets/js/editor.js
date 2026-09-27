/* global tinymce, wp */
/**
 * Classic TinyMCE plugin: adds the "Insert Accordion" toolbar button, a
 * title/content dialog, and registers a wp.mce.views live preview for the
 * [pxta_accordion] shortcode in the Visual tab. The Text tab needs nothing
 * extra - it always shows the raw shortcode.
 */
( function ( tinymce, wp ) {
	'use strict';

	var SHORTCODE = 'pxta_accordion';

	tinymce.PluginManager.add( 'pxta_accordion', function ( editor ) {
		editor.addButton( SHORTCODE, {
			title: 'Insert Accordion',
			text: 'Accordion',
			icon: false,
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
			View: {
				initialize: function ( options ) {
					this.shortcode = options.shortcode;
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
			},
		} );
	}
} )( window.tinymce, window.wp );
