---
title: Sunsetting WordPress
date: 2024-02-05
topics:
- wordpress
---

After nearly 18 years I'm sunsetting my use of WordPress and officially ceasing the development of all my WordPress plugins. With this article I want explain the reasons behind this decision.

## Why Sunsetting WordPress?

I've been a WordPress user since 2006 and a WordPress plugin author at least since 2011.

As technology evolved and with new experience over the years, my view on websites has changed since 2006. Today, for me, WordPress is no longer the solution to build my websites. Instead, I've switched to **static site generators** - [Hugo](https://gohugo.io/) in my case.

There are a couple of reasons for this switch:

1. **Content storage**: I like to write my content in Markdown and version it with Git. Wordpress stores every post or page as HTML in a database.
1. **Security:** Most of the time, I just want to display static content. Having a server-side {{< abbr CMS "Content Management System" >}} like WordPress creates an unnecessary attack surface for hackers. Also, a CMS - with user management, plugins, and themes - increases the complexity of a website. This makes it harder to audit it for security issues.
1. **Compliance with local law:** I need to be able to run my website without breaking the law - which becomes more and more difficult the more rules are created for website owners by the local government.

Especially the European **data protection laws** [GDPR](https://gdpr.eu/) made it much harder to run a website as a *private* citizen (i.e. someone without a fleet of lawyers). For example:

* Do I need a cookie banner? I don't want to track anyone - but WordPress uses cookies. So what do I do?
* What about data collection? How can I figure out whether WordPress or plugin X collects any data for which I need to get permission from my visitors?
* And don't get me started on a German court deciding that [using Google Fonts is a privacy violation](https://www.bitdefender.com/blog/hotforsecurity/german-website-fined-100-euros-after-court-says-googles-font-library-violates-gdpr/).

Wordpress makes it easy to create websites - but it also makes it harder to *exactly* know what you website is doing behind the scenes. (Note: I don't blame WordPress for this. Wordpress was developed for *free* and long before data protection became the major concern it is today.)

All in all, as it stands today, I want my website to be **as simple as possible** - something I *can* audit, if I want to. And this simply means no more (server-side) CMS.

## Sunsetting My WordPress Plugins

Since I'm no longer using WordPress, I don't have any need to update my WordPress plugins on a regular basis. (I wrote all of my plugins primarily because *I* needed them.)

This has been the case for over two years now.

Motivation is one reason for this - but there's also the time it takes to fix, update and test the plugins with each new WordPress version. (There are about 3 - 4 major WordPress releases per year.)

I could leave the plugins as they are (although GitHub reminds me once per week that there are some security issues in my plugins) - but I want to manage expectations here:

By removing my plugins from WordPress' plugin directory, it make it clear to any user of my plugins that there will be **no more updates** for them.

I will archive the GitHub repositories of all my plugins - so if you want to continue using them, you can fork the repositories and adopt them for your needs:

* [BlogText](https://github.com/skrysmanski/blogtext)
* [Font Emoticons](https://github.com/skrysmanski/font-emoticons)
* [Upload Settings](https://github.com/skrysmanski/wp-upload-settings-plugin)
