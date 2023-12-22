---
title: Sort posts by modification date in Wordpress
date: 2013-02-13T11:35:00+01:00
topics:
- wordpress
draft: true
---

By default, Wordpress sorts blog posts by //creation date//. However, if you update your blog posts from time to time, you may want to sort them by //modification date// rather than creation date.

To achieve this, use this snippet:

```php
function order_posts_by_mod_date($orderby) {
  if  (is_home() || is_archive() || is_feed()) {
    $orderby = "post_modified_gmt DESC";
  }

  return $orderby;
}

add_filter('posts_orderby', 'order_posts_by_mod_date', 999);
```

In your theme, just dump this snippet into ##functions.php##. (You may need to create this file in your theme's directory.)
