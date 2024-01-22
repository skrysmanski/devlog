---
title: Indentation in Markdown
date: 2020-07-16
oldContentWarning: false
topics:
- markdown
---

When it comes to indentation in Markdown there are (the usual) two questions:

1. Tabs or spaces?
1. If indenting with spaces, how many?

## Recommendation

My recommendation: **Use Spaces** with an **indent size of 4**.

For the reason, see below.

Also: Use the [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) extension for Visual Studio Code and follow its suggestions regarding indentation.

## Remarks

This document used to contain some more "elaborate" rules regarding **indention of lists**. However, even after working with them for some time (or at least trying to), they never became "natural". These rules felt to cumbersome/complicated to follow. In the end, it was easier to install the markdownlint extension for Visual Studio Code (see above) and let it decide what to indent how. In theory, the indentation rules for lists were nice, but in practice they failed.

## Reasoning

Usually the "tabs vs. spaces" debate comes down to personal preference. There are some arguments for one or the other - but they're "balanced" enough so that no clear winner has ever been chosen.

However, with Markdown **spaces - with an indent size of 4 - are (slightly) better**. Why is that?

### Tabs vs. Spaces

First, lets compare tabs with spaces.

#### Preformatted Text (no winner)

When indenting *preformatted text* in Markdown, there is (usually) no difference in behavior no matter whether you're indenting with tabs or with spaces (with an indent size of 4).

#### Lists (winner: spaces)

When indenting *lists*, you basically have two (visual) indentation styles available:

**Fixed-width indentation:**

```markdown
* item 1
    * sub item 1

1. another list
    1. with another sub item
```

**Compact indentation:**

```markdown
* item 1
  * sub item 1

1. another list
   1. with another sub item
```

I personally find the compact indentation better readable and more natural. However, this notation can be only be done when indenting with spaces. The only down sides are that you can't use your **Tab** key on your keyboard to indent them and that inserting paragraphs and preformatted text blocks in a list item *can* get a little bit more complicated (but never impossible).

**Note:** Someone on the Internet mentioned that some Markdown parsers require the fixed-width indentation notation (i.e. 4 spaces or 1 tab). However, all Markdown parsers I've worked with could handle the compact indentation just fine. So this is *no* real reason to chose the fixed-width indentation notation over the compact one.

#### Tables (winner: spaces)

[Tables](https://www.markdownguide.org/extended-syntax/#tables) are the one place in Markdown where **spaces are significantly better than tabs**. Since tab width can be anything, aligning the pipe characters of a table (`|`) with tabs may result in visually unaligned "columns".

**Note:** Even though we could set the indent size for tabs with `.editorconfig`, any editor/viewer that doesn't support editorconfig would still have the problem with alignment. And while (probably) most editors default to a tab width of 4, this may not be true for every editor/viewer out there.

### Indentation Size

When indenting with spaces, one may be tempted to choose an ident size smaller than 4 (like 2 or 3). However, there are always situations where one level of indentation is not enough. The following list lists the minimum number of spaces required for the various Markdown elements to work/to be recognized (tested in Visual Studio Code and GitHub):

* For *preformatted text*, exactly 4 spaces (additionally to the current indentation level) are required.
* For a *nested list* or *paragraph in a list*, the number of required spaces depends on the width of the list bullet point:
  * For `*` at least 2 spaces are required.
  * For `1.` at least 3 spaces are required.

Since nested lists (when written in the compact notation mentioned above) have no common tab width/indentation size, I recommend using an **indentation size of 4** so that at least preformatted text can be indented by pressing the **Tab** key.
