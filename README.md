# Perxel TinyMCE Accordion

Adds an "Insert Accordion" button to the classic TinyMCE editor and renders it on the front end as a native `<details>`/`<summary>` accordion.

The classic editor has no built-in way to add a collapsible "read more" section to a post. This plugin puts a button in the editor toolbar that inserts an accordion as a plain shortcode, so it stays readable and re-editable in your content.

- [Download the latest release](https://github.com/perxel/wp-tinymce-accordion/releases)
- Report an issue: [github.com/perxel/wp-tinymce-accordion](https://github.com/perxel/wp-tinymce-accordion)

## What you get

- An **Insert Accordion** button in the classic editor toolbar, with a dialog for the title and the body text.
- A live preview of each accordion in the Visual tab, and the plain `[pxta_accordion]` shortcode in the Text tab.
- Front-end accordions built on native `<details>`/`<summary>` - they open and close with no JavaScript.
- A small default stylesheet (arrow indicator, spacing, borders) that your theme can restyle or switch off entirely.
- Two filters for developers: `pxta_accordion_html` to replace the rendered HTML, and `pxta_accordion_load_css` to stop the default stylesheet from loading.

The button shows up in the post and page editor, the widget editors, and any Advanced Custom Fields WYSIWYG field whose toolbar is set to **Full**. There is no settings screen and nothing to configure.

## Screenshots

1. The **Accordion** button in the classic editor toolbar, and the dialog it opens for the title and body text.
2. The accordion on a published post, with the first item open and the second one closed.

<!-- The listing art referenced by these captions lives in .wordpress-org/ - see the README there. -->

## Installation

1. In the WordPress admin go to **Plugins -> Add New -> Upload Plugin**, choose the `perxel-tinymce-accordion.zip` file and click **Install Now**. Alternatively, copy the `perxel-tinymce-accordion` folder into `wp-content/plugins/` and install it from the **Plugins** screen.
2. Click **Activate**.
3. Open a post or page in the classic editor - the **Accordion** button is now in the toolbar, at the end of the first row.

## Requirements

- WordPress 6.5 or newer
- PHP 7.4 or newer
- The classic (TinyMCE) editor for the toolbar button. The shortcode itself renders anywhere shortcodes are processed.

## Using the shortcode

The editor button is just a convenience - the accordion is a normal shortcode, so you can paste it into a Shortcode block, a widget, or a template:

```
[pxta_accordion title="What does it cost?"]Nothing at all - it is free.[/pxta_accordion]
```

## Frequently asked questions

### Why is the button missing from my ACF field?

The button is added to the classic TinyMCE editor, and ACF only offers it to WYSIWYG fields whose **Toolbar** setting is **Full**. With the "Basic" toolbar ACF uses a fixed button list that no plugin can extend, so switch the field's toolbar to Full and reload the field.

### Does it work in the block editor?

The button itself is a classic TinyMCE plugin, so it shows up in the classic editor and in any classic-editor widget. The `[pxta_accordion]` shortcode still renders anywhere shortcodes are processed, so you can also insert it from a Shortcode block or from a template.

### Do the accordions need JavaScript?

No. They are native `<details>`/`<summary>` elements, which browsers open and close on their own. The plugin loads only a small stylesheet on the front end - no JavaScript is enqueued there.

### Can I change the look of the accordion?

Yes, in three ways. Style `.pxta-accordion` and `.pxta-accordion__content` in your theme, return `false` from the `pxta_accordion_load_css` filter to skip the default stylesheet completely, or return your own markup from the `pxta_accordion_html` filter to replace the `<details>` output.

### What happens to my data if I delete the plugin?

This plugin stores no settings and creates no database tables, so there is nothing to clean up. The `[pxta_accordion]` shortcodes already inside your posts are left untouched - they simply stop being rendered once the plugin is gone.

## Data and external services

This plugin stores no settings and creates no database tables, and it does not contact any external service. It sends nothing off your site and adds no tracking. Deleting it removes only its own files.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).
