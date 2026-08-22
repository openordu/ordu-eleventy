---
layout: layouts/default.njk
contributors: [ "Christopher Godwin" ]
tags: docs
time: 2021-01-01
copyright:
  minLength: 1
title: Slides and Tabs
icon: file-powerpoint
---
#### Presentation

:::: carousel
::: slide Slide text 1
stuff
:::
::: slide Slide text 2
stuff2
:::
::: slide Slide text 3
stuff3
:::
::::


:::: carousel

::: slide Caption|3
## Slide 1

A paragraph with some text and a [link](https://cgodwin.io)

:::
::: slide Caption 2|3
## Slide 2

- Item 1
- Item 2

:::
::: slide Caption 3|3

## Slide 3.1

```js
const a = 1;
```

:::
::: slide Caption 4|3

## Slide 3.2

$$
J(\theta_0,\theta_1) = \sum_{i=0}
$$

:::
::::

- [View Details](https://github.com/openordu/markdown-it-ordu)

#### Tabs

``` tab [group1:Home]
...content for Home tab...
::: tip
This is a tip in a tab
:::
```
``` tab [group1:Profile]
...content for Profile tab...
```
``` tab [group1:Contact]
...content for Contact tab...
```
``` tab [group1:Disabled]
...content for Disabled tab...
```

- [View Details](https://github.com/openordu/markdown-it-ordu)

#### Command Tabs
```bash [install:pnpm]
`pnpm add -D onchange`
```
```bash [install:yarn]
`yarn add -D onchange`
```
```bash [install:npm]
`npm i -D onchange`
```

#### Code Tabs
```tab [code:pnpm]
~~~pnpm
pnpm add -D onchange
~~~
```
```tab [code:yarn]
~~~yarn
yarn add -D onchange
~~~
```
```tab [code:npm]
~~~bash
npm i -D onchange
~~~
```

- [View Details](https://github.com/openordu/markdown-it-ordu)