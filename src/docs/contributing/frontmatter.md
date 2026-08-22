---
layout: layouts/default.njk
contributors: [ "Christopher Godwin" ]
tags: docs
time: 2021-01-01
copyright:
  minLength: 1
title: Frontmatter
icon: code


index: 80
---
# Frontmatter

Frontmatter is the way pages of content are configured. At the top of each
Markdown document, a required amount of frontmatter is needed. Front matter is
in yaml format. An example body of frontmatter looks like this:

```yaml
---
title: Title of the Content

icon: sample
---
```

## First Heading
The first heading after the body of frontmatter on a Markdown file should be an
h2 to avoid having double h1s. So it is a standard of ours to assign the value
of the title: tag in frontmatter to the value of the first H1 after the
frontmatter body.

Here is the example:

```md
---
title: Title of the Content

icon: sample
description: Description of this page
---
## Title of the Content <-- this has two pound signs creating an H2
```

## Required Frontmatter options:

* `layout: layouts/default.njk`
* `date: YYYY-MM-DD or YYYY/MM/DD hh:mm:ss`
* `author: your name`
* `contributors: [somebody, somebodyelse, andnowyou] (this is a yaml array)`
* `summary: A brief description of the content`

## Preferred Frontmatter options:

* `title: sometitle`
* `category: reasonablecategory`
* ```yaml
    tag:
    - tag1
    - tag2
    ```
* `icon: <an icon from font icon>`
* `image: http://somepath.com/to/an/image/for/the/page.jpg or /assets/some/public/image/in/the/project.jpg`
* `prev: location/to/previous/content.md`
* `next: location/of/what/to/read/nexd.md`

<!-- ## All Frontmatter options:

You can control quite a great deal about the display of a single page using the
following references:

-->