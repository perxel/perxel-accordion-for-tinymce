# CLAUDE.md

Guidance for working on this repository. This is the **only** agent/maintainer
document (see "Documentation rules" below).

## What this is

`perxel-accordion-for-tinymce` - a **public** WordPress plugin (repo
`github.com/perxel/perxel-accordion-for-tinymce`, WordPress.org slug `perxel-accordion-for-tinymce`,
published under the `phucbm` .org account, branded Perxel).

It was scaffolded from
[`perxel/wp-plugin-starter`](https://github.com/perxel/wp-plugin-starter).

Adds an "Insert Accordion" button to the classic TinyMCE editor (main post
editor, widget editors, ACF WYSIWYG fields set to "Toolbar: Full"). Clicking it
inserts a `[pxta_accordion]` shortcode; the Visual tab renders a live preview
via `wp.mce.views`, the Text tab shows the raw shortcode. On the front end a
PHP shortcode handler renders a WAI-ARIA accordion (heading > `<button
aria-expanded>` + `[hidden]` content region; full markup map at the top of
`pxta-accordion.css`) with a small default stylesheet. `assets/js/pxta-accordion.js`
opens/closes it (enqueued only when an accordion renders). Collapsed unless the
shortcode has `open="1"` ("Open by default" in the dialog); the Visual tab
preview is always open. `<details>/<summary>` was dropped so the title can sit
in a real heading and the content can slide: when the page already loads jQuery
(not a dependency - the script checks `window.jQuery` per click), the content
animates with `slideDown`/`slideUp`; without jQuery, or under
`prefers-reduced-motion`, it toggles `[hidden]` instantly.

This is a custom TinyMCE-4-compatible plugin, not TinyMCE's own built-in
`accordion` plugin - that one requires TinyMCE 6+, and WordPress classic editor
bundles TinyMCE 4.x.

**Upstream rule:** the starter is the source of truth for shared process - CI,
release/deploy, WordPress.org compliance rules, `.distignore`, build scripts, and
the "Releasing" and "Compliance" sections of this file. If you improve or fix one of
those while working here, make the same change in the starter too (or tell the
maintainer), so the next plugin inherits it. Plugin-specific code and listing art
stay here.

## Documentation rules

Every Perxel plugin follows these; they are owned by the starter.

- **`README.md` is public-facing only**: what the plugin does, screenshots,
  install, requirements, what data it stores / external services, license. No
  architecture, folder layout, build/lint/release steps, or "how to extend" -
  none of that belongs on the public page.
- **`CLAUDE.md` is the one and only file for developers and agents**:
  architecture, conventions, compliance, releasing. There is **no `AGENTS.md`**
  (and no second "playbook" file) - do not recreate it or duplicate content
  across the two. Claude Code reads `CLAUDE.md`; other agents can be pointed at it.
- `readme.txt` is the WordPress.org listing, `CHANGELOG.md` (optional) the
  changelog. Neither carries developer guidance.
- Master/source art for `.wordpress-org/` lives in `.claude/assets-src/`.
- `.env.local` holds credentials: never commit it (it is in `.gitignore`).
- `bin/*.sh` derive the slug from the main plugin file, so they are byte-identical
  across plugins - never hard-code a slug in them. Per-plugin Plugin Check
  suppressions go in `lint.yml` -> `ignore-codes`.
- `languages/` is optional; `.org` auto-loads translations.

## Layout

```
perxel-accordion-for-tinymce.php   Main file: header, constants, autoloader, boot
uninstall.php                  No-op - the plugin stores no options and no custom tables
includes/Plugin.php            Singleton, boot() wires Shortcode + Editor
includes/Shortcode.php         add_shortcode(), the pxta_accordion_html filter,
                                asset enqueue + the pxta_accordion_load_css filter
includes/Editor.php            mce_buttons / mce_external_plugins filters,
                                scopes registration to editors with a rich toolbar
assets/js/editor.js            TinyMCE 4 plugin: button + dialog that inserts the
                                shortcode, and the wp.mce.views live-preview registration
assets/js/pxta-accordion.js    Front end: trigger click toggles aria-expanded, the content's
                                hidden attribute and pxta-accordion--open on the wrapper;
                                slides the content if jQuery is on the page
assets/css/pxta-admin.css      Insert-dialog styles, scoped under .pxta-accordion-dialog
                                (the class editor.js adds to the dialog's inner wrapper)
assets/css/pxta-accordion.css  Default accordion styling; loaded on the
                                front end and in the TinyMCE iframe (mce_css)
languages/                     .pot template
readme.txt                     WordPress.org listing (keep in sync with README.md + version)
README.md                      Public-facing GitHub page only (see "Documentation rules")
bin/                            build-zip.sh, update-ui.sh - identical in every plugin
.wordpress-org/                 Listing assets (icon, banner, screenshots) - not shipped
.claude/assets-src/             Master/source art for the listing assets - committed, not shipped
.github/workflows/              lint.yml (PHPCS + Plugin Check), release.yml
.github/assets/                 README-only images (demo.gif) - not shipped, not on .org
```

Both banners in `.wordpress-org/` are resized from
`.claude/assets-src/banner-master.jpg` (1600x518). `README.md` reuses the
`.wordpress-org/` screenshots and the banner master.

`includes/` is loaded by the `spl_autoload_register` in the main file (not
Composer). `Plugin::instance()->boot()` runs on `plugins_loaded` and wires
`Shortcode` and `Editor`.

No custom DB table, no admin settings screen, no REST/AJAX endpoint, and the
`vendor/perxel-ui/` kit is not vendored - nothing in this plugin needs any of
them.

## Architecture

- **`Plugin`** - singleton. `boot()` instantiates `Shortcode` and `Editor` and
  calls `register()` on each.
- **`Shortcode`** - registers `[pxta_accordion]` (`title`, `title_tag`,
  `open`), renders the accordion HTML through the `pxta_accordion_html` filter
  (`title_tag` is the element wrapping the trigger button, default `div`; the
  allow-list `Shortcode::TITLE_TAGS` is mirrored by `TITLE_TAGS` in `editor.js`,
  and the markup by `previewHtml()` there - change both together). Unless
  `pxta_accordion_load_css` returns false, `assets/css/pxta-accordion.css` is
  registered on `wp_enqueue_scripts` and enqueued in the head when the singular
  post's content has the shortcode; `render()` enqueues it too (late, footer)
  for accordions in widgets/fields/templates. `render()` also enqueues
  `assets/js/pxta-accordion.js` (footer), so pages without an accordion load
  neither file.
- **`Editor`** - appends the `pxta_accordion` button to `mce_buttons`,
  registers `assets/js/editor.js` via `mce_external_plugins`, and adds
  `pxta-accordion.css` to `mce_css` (same `pxta_accordion_load_css` gate) so the
  Visual tab preview looks like the front end. These filters are
  global by design (so ACF "Full" WYSIWYG fields, widget editors, etc. all pick
  it up) - do not scope by `$editor_id` unless testing turns up a conflict.
- **Dialog editor must not call `wp_enqueue_editor()`.** The dialog's content
  field is a nested editor built with `wp.editor.initialize()`, which needs
  `wp.editor.getDefaultSettings()`. Core only defines that after
  `wp_enqueue_editor()`, which prints its own default settings (skin
  `lightgray`) and loads a second editor bundle; the skin's global `.mce-*`
  rules then restyle every other TinyMCE editor on the page. Instead
  `ensureEditorDefaults()` in `editor.js` defines `getDefaultSettings()` from
  the host editor's `editor.settings` (skin, `skin_url`, `content_css`,
  language), so TinyMCE's stylesheet loader sees the skin already loaded and adds
  nothing. Leaving the call out with no shim leaves the dialog editor empty
  (`wp.editor.initialize()` returns silently). The Code tab needs
  `window.quicktags` (host has a Text tab); without it the dialog is
  Visual-only. PHP (`Editor::enqueue_editor_assets()`, called from
  `add_button()` so editor-less admin screens load nothing) enqueues only the
  Media Library and `pxta-admin.css`.

This plugin has no custom DB table (see the starter's `CLAUDE.md` for the
`%i`-placeholder rules if one is ever added).

## Conventions

- **Namespace** `Perxel_Accordion_For_Tinymce\` - the slug (`perxel-accordion-for-tinymce`) in
  `Ucfirst_Snake` form, so `WordPress.NamingConventions.PrefixAllGlobals`
  accepts it as the plugin prefix (Plugin Check does not read `phpcs.xml.dist`,
  so a `Vendor\Package`-style namespace would be flagged there). Sub-namespaces
  are fine (`Perxel_Accordion_For_Tinymce\Admin\Foo` -> `includes/Admin/Foo.php`). Hooks,
  option keys and CSS classes stay `pxta_` / `pxta-`; constants `PXTA_`. Product
  name is the constant `PXTA_NAME` (no rebrand option).
- **Text domain** `perxel-accordion-for-tinymce` (= the slug). No JS strings need
  `wp.i18n` here - `editor.js`'s button/dialog labels are short and in English
  only for now; add `wp_set_script_translations()` if that changes.
- **Escape at output, no blanket suppressions.** Never `phpcs:disable` a
  `WordPress.Security.*` sniff (EscapeOutput, NonceVerification) for a file or
  block - the WordPress.org review bot flags it as an escaping/nonce failure
  even when every value is escaped. **Escape late**, at the point of the
  `sprintf()`/echo: `Shortcode::render()` escapes the `title` attribute with
  `esc_html()` and runs `content` through `do_shortcode()` rather than echoing
  it raw. Never an `EscapeOutput` suppression, not even per line - the
  2026-09-23 review of perxel-ai-translate rejected `echo $html; // phpcs:ignore
  ... escaped earlier`. `composer run lint` runs `bin/check-suppressions.sh`,
  which fails on blanket `WordPress.Security` disables and on any
  `EscapeOutput` suppression.
- This plugin does not vendor `vendor/perxel-ui/` - no admin screen needs it.

## Before committing

```bash
php -l <changed files>
composer run lint          # phpcs - must stay green
composer run build         # bin/build-zip.sh - installable zip in dist/
```

`phpcs.xml.dist` curates the base `WordPress` standard: a terse-docblock house
style. CI also runs the official **Plugin Check** action against the built zip
(not the raw checkout).

There are no automated tests and no WP in the lint environment - `phpcs` and
`php -l` verify syntax and style only. Behaviour must be smoke-tested on a real
WordPress site.

## Naming a plugin

Decide the name **before** scaffolding: the slug becomes the folder, main file,
text domain, namespace (`Ucfirst_Snake`), zip and repo, so renaming later touches
everything. Rules from the .org review team (perxel-tinymce-accordion, 2026-09-29):

- Pattern: `Perxel <Distinct Thing> for <Third-party>` - our brand first, the
  third-party trademark/project name last, only after `for` / `with`. Never first
  (`TinyMCE Accordion`), never mid-name (`Perxel TinyMCE Accordion`), never blended
  (`TinyPress`). The slug follows the same order (`perxel-accordion-for-tinymce`).
- "Perxel" is our own mark and the distinguishing term; the reviewer AI still
  lists it as a "potential trademark" - say in the reply that we own it.
- Adding a generic word (Simple, Easy, Advanced, Pro) does not make a name
  distinctive; the brand prefix does. Search the plugin directory + web for the
  name and its parts before submitting.
- The same rule covers `Plugin URI`, repo name, contributor display name and any
  logo or wordmark in the icon/banner - no third-party logos, and never imply
  endorsement.
- If a third-party name appears, add a one-line non-affiliation notice to
  `readme.txt` and `README.md` ("X is a trademark of Y. This plugin is independent
  and not affiliated with or endorsed by Y.").
- A rename is a new slug reservation: reply to the review email asking for it,
  upload a new zip at the "Add your plugin" page, keep the reply short and do not
  list the changes.

## WordPress.org / Plugin Check compliance

Rules that are not obvious and cost real time when re-derived per plugin:

| Rule | Why |
|---|---|
| Namespace root = slug in `Ucfirst_Snake` (`Perxel_Accordion_For_Tinymce`) | `PrefixAllGlobals` accepts it as the prefix; a `Vendor\Package` namespace is flagged (`NonPrefixedNamespaceFound`) and Plugin Check ignores the `phpcs.xml.dist` prefix list |
| No `load_plugin_textdomain()` | .org auto-loads translations (slug == text domain); calling it on `plugins_loaded` is "too early" on WP 6.7+ |
| No `phpcs:disable WordPress.Security.*` anywhere in `includes/` or the main file, and no `EscapeOutput` suppression at all: escape late with `esc_html()` / `esc_attr()` at the point of output | Reviewers flag file-wide security disables (perxel-image-optimizer, perxel-ai-translate 2026-09-22) and per-line "escaped earlier" echoes (perxel-ai-translate 2026-09-23); `bin/check-suppressions.sh` enforces both |
| `set_time_limit()` etc.: `function_exists()` guard + inline `// phpcs:ignore Squiz.PHP.DiscouragedFunctions.Discouraged -- <reason>` | discouraged-function warning |

See the starter's `CLAUDE.md` for the custom-table / `%i`-placeholder rules and
other WPML/WooCommerce-hook and `suppress_filters` notes - none of them apply
to this plugin (no custom tables, no other-plugin hooks), so they're omitted
here rather than carried around unused.

The split that bites: **Plugin Check runs its own ruleset, not `phpcs.xml.dist`.**
Any suppression for a documented false positive goes in *both* places -
`phpcs.xml.dist` (for `composer run lint`) and `lint.yml` -> `ignore-codes`.

## Releasing

1. Bump the version in `perxel-accordion-for-tinymce.php` (header + `PXTA_VERSION`) and
   `readme.txt` (`Stable tag`); add a changelog entry to both `readme.txt` and
   `CHANGELOG.md`. Merge to `main` first. Tag, plugin `Version:` and `Stable tag`
   must all be equal or the deploy fails before touching SVN.
2. Create the tag on `main` and publish a GitHub Release. `release.yml`'s `zip`
   job attaches `perxel-accordion-for-tinymce.zip`; the `deploy` job commits trunk +
   `tags/<version>` + `.wordpress-org/` (-> SVN `assets/`) with the SHA-pinned
   10up action. It only runs when the repo variable `DEPLOY_TO_WPORG` is `true`.
3. Verify `https://wordpress.org/plugins/<slug>/` and
   `https://api.wordpress.org/plugins/info/1.0/<slug>.json` show the new version.
   Assets can 404 on `ps.w.org` for a while after the first commit (CDN lag).

### First release of a new plugin (the only manual bit is the review)

1. Upload `dist/<slug>.zip` at <https://wordpress.org/plugins/developers/add/>.
   No SVN repo exists until the review team approves it.
2. Secrets `SVN_USERNAME` / `SVN_PASSWORD`: set once as **org** secrets and grant
   this repo access (org -> Settings -> Secrets -> Repository access). Use an
   SVN-specific password if the wordpress.org profile offers one. Never paste it
   in chat or commit it.
3. Once approved: set the repo variable `DEPLOY_TO_WPORG=true`, run **Actions ->
   Release -> Run workflow** with the tag and `dry_run` on (default) to check the
   staging without committing, then publish the Release. The very first version
   deploys the same way as every later one - no manual SVN commit.
4. If automation ever breaks, plain `svn` works: check out
   `https://plugins.svn.wordpress.org/<slug>`, copy the `.distignore`-filtered
   build into `trunk/`, `.wordpress-org/*` into `assets/`, `svn cp trunk
   tags/<version>`, `svn ci`.

Notes: a large first commit (hundreds of vendored files) sits on "Committing
transaction..." for minutes - normal. The action strips the `v` from a `vX.Y.Z`
tag itself; on a manual run it can't, hence the explicit `VERSION`. Do not bump
versions, tag or publish releases without the maintainer asking.

Build artifacts (`dist/`) are never committed.
