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
	var CONTENT_EDITOR_ID = 'pxta-accordion-content';
	var DIALOG_MAX_WIDTH = 900;

	// tabler-icons "layout-bottombar-collapse", filled with Perxel blue (#2271B1).
	var BUTTON_ICON =
		'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMjI3MUIxIiBjbGFzcz0iaWNvbiBpY29uLXRhYmxlciBpY29ucy10YWJsZXItZmlsbGVkIGljb24tdGFibGVyLWxheW91dC1ib3R0b21iYXItY29sbGFwc2UiPjxwYXRoIHN0cm9rZT0ibm9uZSIgZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIgLz48cGF0aCBkPSJNMTggM2EzIDMgMCAwIDEgMi45OTUgMi44MjRsLjAwNSAuMTc2djEyYTMgMyAwIDAgMSAtMi44MjQgMi45OTVsLS4xNzYgLjAwNWgtMTJhMyAzIDAgMCAxIC0yLjk5NSAtMi44MjRsLS4wMDUgLS4xNzZ2LTEyYTMgMyAwIDAgMSAyLjgyNCAtMi45OTVsLjE3NiAtLjAwNWgxMnptMCAyaC0xMmExIDEgMCAwIDAgLS45OTMgLjg4M2wtLjAwNyAuMTE3djloMTR2LTlhMSAxIDAgMCAwIC0uODgzIC0uOTkzbC0uMTE3IC0uMDA3em0tNy4zODcgMy4yMWwuMDk0IC4wODNsMS4yOTMgMS4yOTJsMS4yOTMgLTEuMjkyYTEgMSAwIDAgMSAxLjMyIC0uMDgzbC4wOTQgLjA4M2ExIDEgMCAwIDEgLjA4MyAxLjMybC0uMDgzIC4wOTRsLTIgMmExIDEgMCAwIDEgLTEuMzIgLjA4M2wtLjA5NCAtLjA4M2wtMiAtMmExIDEgMCAwIDEgMS4zMiAtMS40OTd6IiAvPjwvc3ZnPg==';

	/**
	 * Builds the [pxta_accordion] shortcode wrapping the given content.
	 *
	 * @param {string} title
	 * @param {string} content
	 * @return {string}
	 */
	function buildShortcode( title, content ) {
		return (
			'[' + SHORTCODE + ' title="' + tinymce.DOM.encode( title ) + '"]' +
			content +
			'[/' + SHORTCODE + ']'
		);
	}

	/**
	 * Full-height dialog, capped at DIALOG_MAX_WIDTH so it stays readable on
	 * wide screens.
	 */
	function dialogSize() {
		var margin = 40;

		return {
			width: Math.min( DIALOG_MAX_WIDTH, window.innerWidth - margin ),
			height: window.innerHeight - 120,
		};
	}

	/**
	 * Opens the title/content dialog, pre-filled with the given values, and
	 * calls onSave( title, content ) when the user confirms. Shared by the
	 * insert button and the Visual tab preview's edit action, so editing an
	 * existing accordion reopens the same dialog.
	 *
	 * The content field is a nested editor built with wp.editor.initialize(),
	 * the same API WordPress itself uses for dynamically-added editors (e.g.
	 * ACF's WYSIWYG field). That gets us the real classic-editor chrome - WP
	 * skin, toolbar, and native Visual/Code tabs - for free, instead of a
	 * bare textarea or a hand-rolled tab toggle.
	 *
	 * @param {tinymce.Editor} editor
	 * @param {string}         initialTitle
	 * @param {string}         initialContent
	 * @param {Function}       onSave
	 */
	function openAccordionDialog( editor, initialTitle, initialContent, onSave ) {
		var size = dialogSize();
		var contentHeight = Math.max( 200, size.height - 260 );

		editor.windowManager.open( {
			title: 'Insert Accordion',
			width: size.width,
			height: size.height,
			body: [
				{
					type: 'textbox',
					name: 'title',
					label: 'Title',
					value: initialTitle,
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
						textarea.value = initialContent;

						wp.editor.initialize( CONTENT_EDITOR_ID, {
							tinymce: {
								menubar: false,
								statusbar: false,
								toolbar1: 'bold,italic,bullist,numlist,blockquote,link,unlink,undo,redo',
								plugins: 'lists,link,paste',
								height: contentHeight,
							},
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

				onSave( e.data.title || '', content == null ? initialContent : content );
			},
			onclose: function () {
				wp.editor.remove( CONTENT_EDITOR_ID );
			},
		} );
	}

	tinymce.PluginManager.add( 'pxta_accordion', function ( editor ) {
		editor.addButton( SHORTCODE, {
			title: 'Insert Accordion',
			text: 'Accordion',
			icon: false,
			image: BUTTON_ICON,
			onclick: function () {
				var selection = editor.selection.getContent( { format: 'raw' } );

				openAccordionDialog( editor, '', selection, function ( title, content ) {
					editor.insertContent( buildShortcode( title, content ) );
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
			edit: function ( text, update ) {
				var title = this.shortcode.attrs.named.title || '';
				var content = this.shortcode.content || '';

				openAccordionDialog( tinymce.activeEditor, title, content, function ( newTitle, newContent ) {
					update( buildShortcode( newTitle, newContent ) );
				} );
			},
		} );
	}
} )( window.tinymce, window.wp );
