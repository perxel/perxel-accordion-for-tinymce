# Changelog

All notable changes to this plugin are documented here. This file mirrors the
`== Changelog ==` section of `readme.txt` (keep the two in sync).

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
