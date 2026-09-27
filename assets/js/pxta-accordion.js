/**
 * Opens and closes [pxta_accordion] accordions: a click on the trigger button
 * flips its aria-expanded, the content's hidden attribute, and the
 * pxta-accordion--open class on the outer wrapper. The server renders the
 * initial state, so nothing runs on load.
 */
( function () {
	'use strict';

	var OPEN_CLASS = 'pxta-accordion--open';

	/**
	 * @param {HTMLElement} trigger The .pxta-accordion__trigger button.
	 * @param {boolean}     open
	 */
	function setOpen( trigger, open ) {
		var content = document.getElementById( trigger.getAttribute( 'aria-controls' ) );
		var wrapper = trigger.closest( '.pxta-accordion' );

		trigger.setAttribute( 'aria-expanded', open ? 'true' : 'false' );

		if ( content ) {
			content.hidden = ! open;
		}

		if ( wrapper ) {
			wrapper.classList.toggle( OPEN_CLASS, open );
		}
	}

	document.addEventListener( 'click', function ( event ) {
		var trigger = event.target.closest && event.target.closest( '.pxta-accordion__trigger' );

		if ( trigger ) {
			setOpen( trigger, trigger.getAttribute( 'aria-expanded' ) !== 'true' );
		}
	} );
}() );
