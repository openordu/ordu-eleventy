---
layout: layouts/default.njk
contributors: [ "Christopher Godwin" ]
tags: docs
time: 2022-04-03
copyright:
  minLength: 1
title: Editing Quickstart
icon: edit

blog: false

order: 96
---
## Editing the Content

All our content is in Enhanced Markdown. See the [Editing guide](/docs/editing) page. Again you can use the gitlab.com website to edit these things. Otherwise just edit these text files
with a text file editor, a markdown editor, or some other editor.

## Content Structure

```
ordu-ui:src/docs/           # These documentation files
ordu-blog:posts/            # Blog, anyone can blog
ordu-guides:hearthkeeper/   # Hearthkeeper & Householders' Guide
ordu-guides:witchcraft/     # Witches' Guide
ordu-guides:seer/           # Fiath's Guide
ordu-guides:poet/           # Poet's Guide
ordu-guides:druid/          # Druid's Guide
pce:*/                      # Public Celtic Encyclopedia
sacred-texts:*/             # Texts from celt.ucc.ie
praxes:*/                   # Practices, customs, prayers, rites, charms
directory/                  # Directory of Groups Practicing Celtic Paganism
```
# Creating new content

::: warning
Markdown content is stored in .md files in directories in the project. Create one and automatically navigate to its path.
To link it from another page, edit that page's markdown creating a [link](/docs/editing/links) to your new content.
:::

# Formatting Content

## Foramtting Quickstart

```

**bold text**
_italicized text_

[Link](https://example.com/)

This makes an ordered list

1. item1
1. item2
1. item3

Unordered list

- item1
- item2
- item3

# Heading1
## Heading2
### Heading3 and so forth
```
::: info Results

**bold text**
_italicized text_

[Link](https://example.com/)

This makes an ordered list

1. item1
1. item2
1. item3

Unordered list

- item1
- item2
- item3

# Heading1
## Heading2
### Heading3 and so forth
:::
To see the full docs on formatting or go to the [Content Demo](/docs/editing) page.

This is just a demo.