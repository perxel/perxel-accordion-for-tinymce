=== Perxel TinyMCE Accordion ===
Contributors: phucbm
Tags: accordion, editor, content, shortcode, tinymce, details
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.0.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Adds an "Insert Accordion" button to the classic TinyMCE editor and renders it on the front end as a native &lt;details&gt;/&lt;summary&gt; accordion.

== Description ==

The classic WordPress editor has no way to add a collapsible "show more"
section to a post. Perxel TinyMCE Accordion adds an **Insert Accordion** button
to the editor toolbar, so an accordion takes a couple of clicks and stays in
your post content as a plain, readable shortcode.

Click the button, fill in a title and the body text, and the editor inserts a
`[pxta_accordion]` shortcode where your cursor was. In the **Visual** tab the
accordion is drawn as a live preview you can open and read while you write; in
the **Text** tab you get the raw shortcode, exactly as typed. On the front end
the shortcode renders native `<details>`/`<summary>` markup, which browsers open
and close on their own - no JavaScript is loaded on your site's front end, just
a small default stylesheet.

The button appears wherever the classic editor does: the post and page editor,
the widget editors, and any Advanced Custom Fields WYSIWYG field whose toolbar
is set to **Full**. There is nothing to configure - no settings screen and no
options stored in the database.

**Key features**

* An **Insert Accordion** button in the classic editor toolbar, with a dialog for the title and the body text.
* A live preview of each accordion in the Visual tab, and the plain shortcode in the Text tab.
* Front-end accordions built on native `<details>`/`<summary>` - they open and close with no JavaScript.
* A small default stylesheet (arrow indicator, spacing, borders) that your theme can restyle or switch off entirely.
* Two filters for developers: `pxta_accordion_html` to replace the rendered HTML, and `pxta_accordion_load_css` to stop the default stylesheet from loading.

You can also write the shortcode by hand, which is handy in a template or a
page built from shortcodes:

```
[pxta_accordion title="What does it cost?"]Nothing at all - it is free.[/pxta_accordion]
```

To wrap the title in a heading or paragraph, add `title_tag` (one of `p`,
`h1`-`h6`, `div`):

```
[pxta_accordion title="What does it cost?" title_tag="h3"]Nothing at all - it is free.[/pxta_accordion]
```

== External services ==

This plugin does not connect to any external services.

== Installation ==

1. In the WordPress admin go to **Plugins -> Add New -> Upload Plugin**, choose the `perxel-tinymce-accordion.zip` file and click **Install Now**. Alternatively, copy the `perxel-tinymce-accordion` folder into `wp-content/plugins/` and install it from the **Plugins** screen.
2. Click **Activate**.
3. Open a post or page in the classic editor - the **Accordion** button is now in the toolbar, at the end of the first row.

That is the whole installation: the plugin has no settings to configure.

== Frequently Asked Questions ==

= Why is the button missing from my ACF field? =

The button is added to the classic TinyMCE editor, and ACF only offers it to
WYSIWYG fields whose **Toolbar** setting is **Full**. With the "Basic" toolbar
ACF uses a fixed button list that no plugin can extend, so switch the field's
toolbar to Full and reload the field.

= Does it work in the block editor? =

The button itself is a classic TinyMCE plugin, so it shows up in the classic
editor and in any classic-editor widget. The `[pxta_accordion]` shortcode still
renders anywhere shortcodes are processed, so you can also insert it from a
Shortcode block or from a template.

= Do the accordions need JavaScript? =

No. They are native `<details>`/`<summary>` elements, which browsers open and
close on their own. The plugin loads only a small stylesheet on the front end -
no JavaScript is enqueued there.

= Can I change the look of the accordion? =

Yes, in three ways. Style `.pxta-accordion` and `.pxta-accordion__content` in
your theme, return `false` from the `pxta_accordion_load_css` filter to skip
the default stylesheet completely, or return your own markup from the
`pxta_accordion_html` filter to replace the `<details>` output.

= What happens to my data if I delete the plugin? =

This plugin stores no settings and creates no database tables, so there is
nothing to clean up. The `[pxta_accordion]` shortcodes already inside your
posts are left untouched - they simply stop being rendered once the plugin is
gone.

== Screenshots ==

1. The **Accordion** button in the classic editor toolbar, and the dialog it opens for the title and body text.
2. The accordion on a published post, with the first item open and the second one closed.

== Changelog ==

= 0.0.3 =
* Fix: the "Insert Accordion" dialog is now sized to the viewport (capped at 900px wide) instead of TinyMCE's small default.
* Fix: the Visual tab preview's edit (pencil) button now reopens the dialog instead of doing nothing.
* Change: the dialog's content field is now a real classic-editor instance (same toolbar and Visual/Code tabs as the main editor) instead of a plain textarea with Quicktags.

= 0.0.2 =
* Fix: the Visual tab preview showed a stuck loading spinner instead of the accordion; the `wp.mce.views` registration now matches WordPress core's expected structure.
* Change: the dialog's content field gets Quicktags (link/list buttons) instead of a plain textarea.
* Change: the toolbar button now shows a Perxel-blue icon.

= 0.0.1 =
* First release.
* Adds an "Insert Accordion" button to the classic TinyMCE editor. A title/content dialog inserts a `[pxta_accordion]` shortcode at the cursor.
* The Visual tab renders the shortcode as a live preview via `wp.mce.views`; the Text tab shows the raw shortcode.
* On the front end the shortcode renders native `<details>`/`<summary>` HTML with a small default stylesheet - no JavaScript.
* Two filters for themes and plugins: `pxta_accordion_html` to replace the rendered markup, and `pxta_accordion_load_css` to switch off the default stylesheet.
