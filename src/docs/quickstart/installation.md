---
layout: layouts/default.njk
icon: "brands fa-git"
title: Git Installation
time: 2022-12-27
tags:
  - Introduction
  - Documentation
index: 99

---

# Git Installation

## Everything is Done with `git`

If you are a user of linux, we'll assume you know how to use the basic git
commands.

## How to make a change

These are the direct commands in order to pull the project down, to edit it, and
to send a change back up to the project in *your own branch*:

* `git clone https://github.com/openordu/pce`
* `git checkout -b feature/my-branch-name`
*  edit `pce/a/abarta.md` with a text editor or run
* `nano -w pce/a/abarta.md`
* `git add pce/a/abarta.md`
* `git commit -m 'edited pce/a/abarta.md'`
* `git push`

If you are not familiar with git, you must learn to interact with this project.

The [Process](/docs/contributing/process) itself is a graphical representation of `git` commands and interactions with repo [website](/).

Everything happens via `git` except for the discussion, approval, and merge.

::: tip
All of this is easier to do in [WSL](https://docs.microsoft.com/en-us/windows/wsl/install) or even [Cygwin](https://www.cygwin.com/). If you know how, you should use those options instead.
:::

## Installing Gitforwindows

1. Go to [git for windows](https://gitforwindows.org/) and click the download button. Follow the instructions(or just hit next rapidly until the shiny bar starts pulsating).
1. Check the box that says `Launch Git Bash` on the final screen and press `Finish`.
1. Type `git version` and you should see something like what is below:

```bash
git version
```

Result:

> ==git version 2.34.1.windows.1==

Now you are ready to roll. Run `pwd` in order to see where you are.

```bash
pwd
```

Result:

> ==/c/Users/Chris Godwin==

## Installing git with Chocolatey

1. Save the script below as ChocolateyInstallNonAdmin.ps1.
1. Use the script below, determine where you might want Chocolatey installed if it is not to C:\ProgramData\chocoportable.
1. Open PowerShell.exe.
1. Run the following Set-ExecutionPolicy Bypass -Scope Process -Force;
1. Run .\ChocolateyInstallNonAdmin.ps1.

```bash
$InstallDir='C:\ProgramData\chocoportable'
$env:ChocolateyInstall="$InstallDir"
Set-ExecutionPolicy Bypass -Scope Process -Force;
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

```
choco install git.commandline -y
 Do you want to continue?([Y]es/[N]o): Y

git version
```

Result:

> ==git version 2.34.1.windows.1==

## Or Just Use github

As an alternative you can use the website based editor which is a graphical git client over at the [Github Project](https://github.com/openordu)