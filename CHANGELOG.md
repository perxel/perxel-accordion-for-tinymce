# Changelog

All notable changes to this plugin are documented here. This file mirrors the
`== Changelog ==` section of `readme.txt` (keep the two in sync).

## 0.0.7

* Change: renamed to Perxel Accordion for TinyMCE (slug `perxel-accordion-for-tinymce`). Deactivate and delete the old Perxel TinyMCE Accordion plugin before activating this one. Existing `[pxta_accordion]` shortcodes keep working.
* New: an image button in the dialog's content editor toolbar that opens the Media Library.
* Fix: the dialog no longer loads a second copy of the editor scripts and skin, which restyled other TinyMCE editors on the same screen.
* Fix: editor scripts are loaded only when an editor is actually printed, so admin screens without an editor are no longer affected.
* Fix: saving the dialog now applies to the editor it was opened from, and the inline view toolbar is hidden while the dialog is open and after it closes.

## 0.0.6

* New: a table button in the dialog's content editor toolbar, shown when the main editor already has a table plugin (for example TinyMCE Advanced or one added by your theme).
* Fix: text placed before a table (or other block) in the dialog was followed by an empty paragraph on the front end.

## 0.0.5

* Fix: the link button in the dialog's content editor opened its URL popup hidden behind the dialog, so links (and the "Open link in a new tab" option under Link options) could not be added.
* Change: removed the blockquote button from the dialog's content editor toolbar.

## 0.0.4

* Change: the accordion is now built as a WAI-ARIA accordion - the title is a button inside a heading (the Title tag setting: div by default, p or h1-h6), so headings stay in screen-reader heading navigation. It replaces the native `<details>`/`<summary>` markup.
* New: an "Open by default" checkbox in the dialog. Accordions start collapsed unless it is ticked; the Visual tab preview is always shown open.
* New: a small dependency-free front-end script opens and closes accordions and adds the `pxta-accordion--open` class to an open accordion's wrapper. It loads only on pages that contain an accordion. When the page already loads jQuery, the content slides open and closed (instantly for visitors who prefer reduced motion).
* New: the Title tag setting in the dialog.
* Change: restyled default look - light grey panel with rounded corners, a divider above the content, arrow on the right, visible keyboard focus ring, and no arrow animation for visitors who prefer reduced motion.
* Change: the accordion stylesheet now also loads in the classic editor, so the Visual tab preview matches the front end. On the front end it loads only on pages that show an accordion.
* Fix: no more empty paragraphs at the start and end of the accordion content, left behind by WordPress's automatic paragraphs.
* Fix: the dialog now fits small screens, and its content editor inherits the main editor's styles and shows styled Visual/Code tabs.

## 0.0.3

* Fix: the "Insert Accordion" dialog is now sized to the viewport (capped at 900px wide) instead of TinyMCE's small default.
* Fix: the Visual tab preview's edit (pencil) button now reopens the dialog instead of doing nothing.
* Change: the dialog's content field is now a real classic-editor instance (same toolbar and Visual/Code tabs as the main editor) instead of a plain textarea with Quicktags.

## 0.0.2

* Fix: the Visual tab preview showed a stuck loading spinner instead of the accordion; the `wp.mce.views` registration now matches WordPress core's expected structure.
* Change: the dialog's content field gets Quicktags (link/list buttons) instead of a plain textarea.
* Change: the toolbar button now shows a Perxel-blue icon.

## 0.0.1

* First release.
* Adds an "Insert Accordion" button to the classic TinyMCE editor. A title/content dialog inserts a `[pxta_accordion]` shortcode at the cursor.
* The Visual tab renders the shortcode as a live preview via `wp.mce.views`; the Text tab shows the raw shortcode.
* On the front end the shortcode renders native `<details>`/`<summary>` HTML with a small default stylesheet - no JavaScript.
* Two filters for themes and plugins: `pxta_accordion_html` to replace the rendered markup, and `pxta_accordion_load_css` to switch off the default stylesheet.
