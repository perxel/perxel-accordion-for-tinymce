# Insert Accordion dialog — findings (2026-09-27)

Session notes on fixing three reported issues with the TinyMCE 4 "Insert
Accordion" dialog (`assets/js/editor.js`). Kept here as research/knowledge,
not maintainer instructions — see `CLAUDE.md` for the authoritative
architecture/conventions doc.

**Not yet manually smoke-tested in a live WP editor** (no browser-automation
permission this session) — verify the three fixes below on a real site before
relying on this note as confirmation they work.

## 1. Dialog size — no native "fullscreen"

TinyMCE 4's `editor.windowManager.open()` has no fullscreen mode; it only
takes fixed `width`/`height` on the options object. To get "full screen,
capped at 900px", compute size from the viewport at open time:

```js
width: Math.min( 900, window.innerWidth - 40 ),
height: window.innerHeight - 120,
```

`window.innerWidth/innerHeight` are correct here because the dialog chrome
renders in the top-level `wp-admin` document, not inside the editor's content
`<iframe>`.

## 2. The Visual-tab preview's "Edit" (pencil) button was a silent no-op

Root cause, confirmed by reading WordPress core's
`src/js/_enqueues/wp/mce-view.js` (the source for
`wp-includes/js/mce-views.js`):

```js
// wp.mce.views.edit(editor, node):
edit: function( editor, node ) {
    var instance = this.getInstance( node );
    if ( instance && instance.edit ) {
        instance.edit( instance.text, function( text, force ) {
            instance.update( text, editor, node, force );
        } );
    }
}
```

The base `wp.mce.View.prototype` does **not** define `edit` — core's
gallery/audio/video/embed views add it themselves (they open a media frame).
Our `wp.mce.views.register( 'pxta_accordion', {...} )` object only had
`initialize`/`getHtml`, so `instance.edit` was `undefined` and clicking the
pencil icon did nothing. Fix: add an `edit( text, update )` method that reads
`this.shortcode.attrs.named.title` / `this.shortcode.content`, opens the same
dialog used by the toolbar button, and calls `update( newShortcodeString )` on
save — this both replaces the shortcode text and re-renders the preview via
`instance.update()` internally.

`tinymce.activeEditor` is used as the editor reference inside `edit()`
because the view instance isn't necessarily bound to a single editor
instance; this matches the pattern core's own view types use implicitly
through `media[type].edit()`.

## 3. Content field showed raw HTML instead of a rich-text view

The original dialog used a plain `textbox` (multiline textarea) plus
Quicktags, so any inserted markup (e.g. `<strong>`) showed as literal tags.

**First attempt (superseded, see below):** a nested `tinymce.init()` editor
plus a hand-rolled Visual/Text tab toggle (two buttons, toggling
`editor.getContainer()` display and syncing via `.save()`/`.setContent()`).
It worked but had a real bug and looked wrong:

- **Visual tab was blank on open**, only appearing after switching to Text
  and back. Cause: the field's `<textarea>` was given inline
  `display: none` *before* `tinymce.init()` ran on it. TinyMCE measures the
  target element's box to size its iframe at init time; initializing against
  a hidden (0×0) element produces a UI that never gets a correct size until
  something forces a reflow (which switching tabs did, incidentally). Lesson:
  never pre-hide the source element yourself — let TinyMCE hide it, which it
  already does automatically as part of `init()`.
- **Looked "alien"** — a bare `tinymce.init()` doesn't automatically inherit
  WordPress's editor skin/typography (`content_css`, `body_class`, icon
  set), and the hand-rolled tab buttons didn't match `.wp-switch-editor`
  styling at all.

**Final approach:** use WordPress's own `wp.editor.initialize( id, settings )`
/ `wp.editor.remove( id )` / `wp.editor.getContent( id )` API (source:
`src/js/_enqueues/wp/editor/base.js` in `wordpress-develop`, the `wp.editor`
half of what used to be `wp-admin/js/editor.js`). This is the same API
WordPress itself uses to spin up editors dynamically elsewhere (e.g. ACF's
WYSIWYG field, metaboxes added via AJAX). Calling it with both `tinymce` and
`quicktags` settings makes it build the *actual* `.wp-editor-wrap` markup —
real `.wp-switch-editor` "Visual"/"Code" tabs, same skin/content CSS as the
main post editor — instead of anything custom:

```js
wp.editor.initialize( CONTENT_EDITOR_ID, {
    tinymce: { menubar: false, statusbar: false, toolbar1: '...', plugins: '...', height: h },
    quicktags: { buttons: 'strong,em,link,ul,ol,li,close' },
    mediaButtons: false, // no "Add Media" row for a shortcode's inner content
} );
```

`wp.editor.getContent( id )` handles reading the value correctly regardless
of which tab (Visual/Code) is active at submit time — it calls the TinyMCE
instance's `.save()` internally if it isn't hidden, then reads the
underlying textarea — so no manual active-tab tracking is needed.
`wp.editor.remove( id )` tears down both the TinyMCE and Quicktags instances
and unwraps the DOM back to a plain textarea, for reuse on the next open.

This needs `wp_enqueue_editor()` called PHP-side (added as
`Editor::enqueue_editor_assets()`, hooked on `admin_enqueue_scripts`) so the
`wp.editor` JS API is guaranteed to be loaded even on screens where it
wouldn't otherwise be (the previous `Editor::enqueue_quicktags()` this
replaced only loaded the `quicktags` script, not `wp.editor.initialize` and
its scaffolding).
