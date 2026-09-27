# Perxel TinyMCE Accordion — implementation plan

## Status: done (2026-09-27)

Tasks 1–5 and 7 are complete and committed on `main`:

- `00d399d` Rebrand starter template to Perxel TinyMCE Accordion
- `794a571` Add accordion shortcode and TinyMCE editor button
- `5b13303` Write readme.txt, README.md and CHANGELOG.md for the accordion plugin
- `9dfe5a8` Add plugin icon for the WordPress.org listing (not in the original
  task list — the maintainer supplied a logo mid-session; cropped to square as
  `.claude/assets-src/icon-master.png`, resized to `.wordpress-org/icon-128x128.png`
  and `icon-256x256.png`. No banner or screenshots yet.)

`composer run lint` is clean, `composer run build` produces a correctly-scoped
23-file zip. Version is `0.0.1` (plugin header, `PXTA_VERSION`, `readme.txt`
Stable tag, and the changelog entry all agree).

**Task 6 (manual smoke test on a real WordPress install) was not run** — it
needs a real WP site and, for the browser-driven parts, the user's explicit
permission for `mcp__claude-in-chrome__*` calls per global instructions, which
was not requested/granted this session. Treat the TinyMCE button, the
`wp.mce.views` live preview, and the ACF-repeater case as **unverified against
a live editor** until someone runs that checklist.

Open decisions below are resolved: one combined `assets/js/editor.js` (not two
files); the dialog collects title + content, pre-filled from the current
selection; and yes, ship a full `readme.txt`/`.org` listing (readme.txt was
filled in as if this may go to WordPress.org).

## Goal

A standalone WordPress plugin (scaffolded from `wp-plugin-starter`, this repo)
that adds an "Insert Accordion" button to the **classic TinyMCE editor**
(main post editor, widget editors, and any ACF WYSIWYG field set to the
"Full" toolbar). Clicking it inserts a shortcode. The shortcode renders as a
live preview in the Visual tab (via WordPress's native `wp.mce.views` API)
and as plain text in the Text tab. On the front end, a PHP shortcode handler
renders `<details>/<summary>` HTML with a small default stylesheet — no JS.
Themes get a filter to replace the HTML entirely and a filter to stop the
default CSS from loading.

This does **not** use TinyMCE's own built-in `accordion` plugin — confirmed
via <https://www.tiny.cloud/docs/tinymce/latest/accordion/> that it requires
TinyMCE 6+, and WordPress classic editor bundles TinyMCE 4.x. Everything here
is a custom TinyMCE-4-compatible plugin plus a normal WordPress shortcode.

## Naming (scaffold tokens, per `README.md` step 2)

| Token | Value |
|---|---|
| `Perxel_Example` → | `Perxel_Tinymce_Accordion` |
| `Perxel Example` → | `Perxel TinyMCE Accordion` |
| `perxel-example` → | `perxel-tinymce-accordion` |
| `wp-example` → | `wp-tinymce-accordion` |
| `PXEX` → | `PXTA` |
| `pxex` → | `pxta` |

Shortcode tag: `[pxta_accordion]` (prefixed — a bare `[accordion]` tag is too
likely to collide with another plugin or theme).

## Architecture

```
perxel-tinymce-accordion.php   Main file: header, constants, autoloader, boot
includes/Plugin.php            Singleton, boot() wires Shortcode + Editor
includes/Shortcode.php         add_shortcode(), the pxta_accordion_html filter,
                                asset enqueue + the pxta_accordion_load_css filter
includes/Editor.php            mce_buttons / mce_external_plugins filters,
                                scopes registration to editors with rich toolbar
assets/js/editor-button.js     TinyMCE 4 plugin: button, title/content dialog,
                                inserts the shortcode
assets/js/editor-view.js       wp.mce.views registration: renders the live
                                preview in the Visual tab from shortcode content
assets/css/frontend.css        Default details/summary styling (no JS)
```

No custom DB table, no admin settings screen, no REST/AJAX endpoint — nothing
in this plugin needs one. The kit (`vendor/perxel-ui/`) can be skipped;
delete the Settings/Admin scaffolding rather than adapt it (see Task 1).

### Backend contract (already agreed in chat)

```php
// includes/Shortcode.php
add_shortcode( 'pxta_accordion', function ( $atts, $content = null ) {
    $atts = shortcode_atts( array( 'title' => '' ), $atts, 'pxta_accordion' );

    $html = sprintf(
        '<details class="pxta-accordion"><summary>%s</summary><div class="pxta-accordion__content">%s</div></details>',
        esc_html( $atts['title'] ),
        do_shortcode( $content )
    );

    return apply_filters( 'pxta_accordion_html', $html, $atts, $content );
} );

add_action( 'wp_enqueue_scripts', function () {
    if ( apply_filters( 'pxta_accordion_load_css', true ) ) {
        wp_enqueue_style( 'pxta-accordion', ..., array(), PXTA_VERSION );
    }
    // No JS enqueued by default — <details> is native.
} );
```

### Editor contract

- `mce_buttons` (or `_2`) appends `pxta_accordion` to the toolbar.
- `mce_external_plugins` registers `assets/js/editor-button.js` and
  `assets/js/editor-view.js` (or one combined file — decide during Task 3,
  whichever keeps `editor.addButton` and the `wp.mce.views` registration
  readable).
- Button click → `editor.windowManager.open()` dialog (title + body, body
  pre-filled from the current selection if any) → on submit,
  `editor.insertContent('[pxta_accordion title="..."]...[/pxta_accordion]')`.
- `wp.mce.views.register('pxta_accordion', { ... })` parses the shortcode
  instance and renders a preview node in the Visual tab (can literally render
  a `<details>` for the live preview — doesn't have to match the front-end
  filter output).
- Text tab: unchanged, shows the raw shortcode — this is the native
  behaviour of `wp.mce.views`, nothing to build for it.
- These filters are global by design (so ACF "Full" WYSIWYG fields, widget
  editors, etc. all pick it up) — do not scope by `$editor_id` unless testing
  turns up a conflict.

### Compliance notes (from this repo's `CLAUDE.md` — do not relitigate, follow as-is)

- Namespace root `Perxel_Tinymce_Accordion`, hooks/constants `pxta_` / `PXTA_`.
- Escape late, at the point of `sprintf`/echo, via `esc_html()` /
  `esc_attr()`. Never a blanket `EscapeOutput` or `WordPress.Security.*`
  suppression — `bin/check-suppressions.sh` enforces this and CI will fail.
- `wp_kses()` with a narrow allowlist if the shortcode's inner `$content` is
  ever echoed without going through `do_shortcode()`/`the_content` first —
  confirm during Task 2 whether extra sanitizing is needed beyond what
  `do_shortcode()` + the editor's own save-time sanitizing already provide.
- No `load_plugin_textdomain()` (per starter rules) — translations auto-load.
- `bin/build-zip.sh` / `bin/check-suppressions.sh` / CI stay byte-identical to
  the starter; don't hand-edit them for this plugin.

### ACF / other editors — verify, don't assume

- Works out of the box for the main post editor and any ACF WYSIWYG field
  set to **Toolbar: Full**. ACF's "Basic" toolbar mode hardcodes a button
  set and won't show custom buttons — that's a field-config choice, not a
  plugin bug, and worth a one-line note in `README.md`'s FAQ.
- ACF repeater / flexible-content fields initialize their WYSIWYG editors
  dynamically. The plugin's JS should still load correctly (it's part of the
  global TinyMCE init config ACF reuses), but this is the one behaviour to
  actually click-test rather than assume — put it in the manual test
  checklist (Task 6), not skip it.

## Task breakdown

| # | Task | Owner | Verify | Status |
|---|---|---|---|---|
| 1 | Token rename (starter → plugin), delete unused Settings/Admin/kit scaffolding not needed by this plugin, rename main file + `.pot` | **Claude** | `git grep` for leftover `Perxel_Example`/`PXEX`/`pxex`/`perxel-example` tokens returns nothing; `php -l` on remaining files | **Done** |
| 2 | `includes/Shortcode.php` — shortcode handler, both filters, asset enqueue | **Claude** | manual read against the contract above; `composer run lint` | **Done** |
| 3 | `includes/Editor.php` + `assets/js/editor-*.js` — button, dialog, shortcode insert, `wp.mce.views` preview | **Claude** | `composer run lint`; manual smoke test in a real WP install (Task 6) | **Done** (as one `assets/js/editor.js`); lint clean, smoke test still pending (Task 6) |
| 4 | `assets/css/frontend.css` — default `<details>/<summary>` styling (arrow icon, spacing, no JS) | **opencode** (free model, text-only is fine) | Claude reviews the diff, opens it in a browser test page, checks it doesn't fight the shortcode's class names from Task 2 | **Done** — reviewed the diff (no browser check, see Task 6) |
| 5 | `readme.txt` + `README.md` fill-in (Description, Installation, FAQ incl. the ACF "Full toolbar" note, Screenshots placeholder, first `CHANGELOG.md` entry) | **opencode** (free model) | Claude reads the diff for accuracy against this plan; confirms no architecture/build content leaked into `README.md` (starter rule: README is public-only) | **Done**; Claude also dropped the stale 0.0.x changelog entries the worker inherited from the starter (they described the removed Admin/kit code, not this plugin) |
| 6 | Manual smoke test on a real WordPress install: button appears in main editor and in an ACF "Full" WYSIWYG field; insert → Visual tab shows preview, Text tab shows raw shortcode; save/reload keeps the shortcode intact (not mangled by `wpautop` or TinyMCE's sanitizer); front end renders the `<details>` HTML; `pxta_accordion_html` and `pxta_accordion_load_css` filters work from a throwaway `functions.php` snippet; **repeat inside an ACF repeater row** specifically | **Claude**, browser-driven — **ask the user for explicit permission before any `mcp__claude-in-chrome__*` call**, per global instructions; if not granted, do `php -l` + `composer run lint` only and say plainly the UI wasn't visually tested | Pass/fail list per bullet above | **Not run** — needs a real WP install and, for the browser parts, explicit permission that wasn't requested/granted this session |
| 7 | `composer run lint` clean, `composer run build` produces a zip | **Claude** | CI-equivalent local run before calling this done | **Done** — 0 lint errors, `dist/perxel-tinymce-accordion-0.0.1.zip` (23 files, no scaffolding leftovers) |

Tasks 4–5 are the only bulk/mechanical, cheaply-checked chunks — CSS and
prose. Everything touching security-sensitive output escaping, WordPress.org
compliance, or the TinyMCE/`wp.mce.views` integration stays with Claude,
since a wrong shortcode-escaping or nonce call is exactly the kind of mistake
that's expensive to catch after the fact, not cheap.

## Worker prompt drafts (Tasks 4–5)

**Task 4 — frontend CSS:**
```
You are a worker. Another agent (Claude) checks your work and does all commits. Do not delegate or use the opencode-delegate skill.

Task: write assets/css/frontend.css for a WordPress plugin's accordion component.
Read first: includes/Shortcode.php (for the exact class names the shortcode outputs)
Inputs: the markup is `<details class="pxta-accordion"><summary>...</summary><div class="pxta-accordion__content">...</div></details>`
You may edit only: assets/css/frontend.css
Done when: the file exists, has no JS, styles the arrow indicator (::marker or a custom triangle), adds reasonable padding/spacing/background matching a plain editorial look (not flashy), and does not use !important.

Rules:
- Never run git, gh, npm publish/install, deploys, or anything that commits, pushes, deletes or sends.
- Only write what the inputs show. Never guess or invent class names not in Shortcode.php.
- If you can't do part of it, stop that part and say "CANNOT: <why>".
Last lines: one status line, e.g. "frontend.css: done".
```

**Task 5 — readme/README fill-in:**
```
You are a worker. Another agent (Claude) checks your work and does all commits. Do not delegate or use the opencode-delegate skill.

Task: fill in the free-text sections of readme.txt and README.md for a WordPress plugin.
Read first: CLAUDE.md section "Documentation rules" (README.md is public-facing ONLY — no architecture, no build steps); .claude/plans/accordion-plugin-plan.md for what the plugin does
Inputs: readme.txt, README.md (both currently starter placeholders)
You may edit only: readme.txt, README.md, CHANGELOG.md
Done when: readme.txt has a real Description, Installation, FAQ (including a note that ACF WYSIWYG fields need "Toolbar: Full" for the button to appear), and a Screenshots placeholder; README.md is public-facing only and matches; CHANGELOG.md has one "Unreleased" or "0.1.0" entry describing the initial feature.

Rules:
- Never run git, gh, npm publish/install, deploys, or anything that commits, pushes, deletes or sends.
- Only write what the inputs show. Never guess features not in the plan doc.
- If you can't do part of it, stop that part and say "CANNOT: <why>".
Last lines: one status line per file, e.g. "readme.txt: done".
```

## Open decisions to confirm with the user before/while building

- One combined `assets/js/editor.js` vs. two files (`editor-button.js` +
  `editor-view.js`) — cosmetic, default to one file unless it gets unwieldy.
- Whether the dialog collects a body/content field or just uses the current
  editor selection as the shortcode's inner content — affects `editor-button.js`
  only, decide during Task 3.
- Whether to ship a `readme.txt`/`.org` listing at all, or keep this
  internal-only (skip WordPress.org submission steps in `CLAUDE.md` ->
  "Releasing" entirely). Doesn't block Tasks 1–4.
