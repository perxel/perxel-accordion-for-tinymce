/**
 * Opens and closes [pxta_accordion] accordions: a click on the trigger button
 * flips its aria-expanded, the content's hidden attribute, and the
 * pxta-accordion--open class on the outer wrapper. The server renders the
 * initial state, so nothing runs on load.
 *
 * When the page already loads jQuery, the content slides open/closed
 * (slideDown/slideUp); otherwise, or when the visitor prefers reduced motion,
 * it toggles instantly. jQuery is not a dependency of this script.
 */
( function () {
	'use strict';

	var OPEN_CLASS = 'pxta-accordion--open';
	var DURATION = 200;

	/**
	 * @return {Function|null} jQuery, if loaded and motion is allowed.
	 */
	function slider() {
		var $ = window.jQuery;

		if ( ! $ || ! $.fn || ! $.fn.slideDown ) {
			return null;
		}

		if ( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
			return null;
		}

		return $;
	}

	/**
	 * @param {HTMLElement} content The .pxta-accordion__content region.
	 * @param {boolean}     open
	 */
	function toggleContent( content, open ) {
		var $ = slider();
		var $content;

		if ( ! $ ) {
			content.hidden = ! open;
			return;
		}

		$content = $( content ).stop( true );

		if ( open ) {
			// Fully closed: swap [hidden] for jQuery's inline display:none so
			// slideDown has something to animate from.
			if ( content.hidden ) {
				content.hidden = false;
				$content.hide();
			}

			$content.slideDown( DURATION, function () {
				content.style.display = '';
			} );
		} else {
			$content.slideUp( DURATION, function () {
				content.hidden = true;
				content.style.display = '';
			} );
		}
	}

	/**
	 * @param {HTMLElement} trigger The .pxta-accordion__trigger button.
	 * @param {boolean}     open
	 */
	function setOpen( trigger, open ) {
		var content = document.getElementById( trigger.getAttribute( 'aria-controls' ) );
		var wrapper = trigger.closest( '.pxta-accordion' );

		trigger.setAttribute( 'aria-expanded', open ? 'true' : 'false' );

		if ( content ) {
			toggleContent( content, open );
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
