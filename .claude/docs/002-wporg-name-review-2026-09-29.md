# WordPress.org review: plugin name / trademark (2026-09-29)

Plugin: "Perxel TinyMCE Accordion", slug `perxel-tinymce-accordion`, account `phucbm`.

## Finding (single issue)

The review AI flagged "Perxel, TinyMCE" as potential trademarks. The actionable one:

> "TinyMCE" is a third-party registered project name used without wording that
> clearly identifies this as a third-party integration, which can imply official
> affiliation.

Suggested: name **Perxel Accordion for TinyMCE**, slug **perxel-accordion-for-tinymce**.

## Rules the reviewers stated

- A third-party trademark/project name must not be first, and must not sit in the
  name without a clear "for <X>" / "with <X>" structure. Put it at the END after "for".
- No portmanteaus / altered forms (e.g. "PricesPress").
- The distinguishing term (our brand, coined word) goes at the BEGINNING, not the end.
- Adding a generic word ("Easy", "Advanced", "Simple") does not fix similarity.
- Also checked: .org username/display name, contributor names, plugin URLs
  (Plugin URI, repo, slug), and icon/banner artwork.
- Owner-of-trademark exception: only if we are the owner (we are not for TinyMCE).
- Should be a short reply, no change list; add only context that helps the review.
- Unfixed = rejected after 3 months.

## Our analysis

- "TinyMCE" (Tiny Technologies) is the problem: it is the 2nd word, in the middle,
  with no "for" structure. Slug has the same issue.
- "Perxel" is our own brand (we own it, perxel.com, author = Perxel, .org profile
  "Phuc Bui (PERXEL)"). It is the distinguishing term and is already first: keep it.
  Mention ownership in the reply so it is not treated as someone else's mark.
- Renaming per the suggestion fits every rule: brand first, third-party name last after "for".

## Solution

1. Display name -> **Perxel Accordion for TinyMCE** (plugin header, `readme.txt`
   title + body mentions, `README.md`, `.pot` header).
2. Slug/folder/main file -> `perxel-accordion-for-tinymce` (text domain, zip name,
   `.pot` filename, URLs in header/readme/README, `Plugin URI`, GitHub repo rename).
3. Namespace -> `Perxel_Accordion_For_Tinymce` (slug in `Ucfirst_Snake`); update
   `@package`, `phpcs.xml.dist` prefixes, `composer.json`, `lint.yml`/`release.yml`
   refs. `pxta_` / `PXTA_` prefixes can stay (still >= 4 chars, unique).
4. Add a non-affiliation line to `readme.txt` + `README.md`: "TinyMCE is a trademark
   of Tiny Technologies, Inc. This plugin is independent and not affiliated with
   or endorsed by Tiny."
5. Check `.wordpress-org/` banner/icon and `.claude/assets-src/` masters contain no
   TinyMCE logo/wordmark (only plain descriptive text is fine).
6. Build, upload the new zip at the "Add your plugin" page while logged in as
   `phucbm`, and reply to the review email (short): new name/slug, request the new
   slug reservation, note that Perxel is our own brand and TinyMCE appears only
   after "for" with a non-affiliation disclaimer.

Open point: the current version 0.0.6 has never been published, so no SVN/redirect
concerns; the GitHub repo rename is outward-facing - do it only when the maintainer says so.
