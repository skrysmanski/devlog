# Notes on this folder

This folder contains the HTML template for the site:

* baseof.html : The base template used by all pages
* single.html : The template used for single pages
* list.html : The template used for list page (i.e. a list of pages)
* terms.html : The template used when browsing a single term (e.g. a single tag)
* index.html : The home/start page
* `_markup` : Markdown render hooks - <https://gohugo.io/templates/render-hooks/>

Note that the names in this folder are fixed and can't be changed arbitrarily. See: <https://gohugo.io/templates/lookup-order/>

Additional useful links:

* Template lookup: https://gohugo.io/templates/lookup-order/
* The "blocks" concept: https://gohugo.io/templates/base/
* Context (aka "the dot"): https://gohugo.io/templates/introduction/#the-dot
  * NOTE: "$." (aka "global context") is not(!) passed to partials
* The ".Page" object: https://gohugo.io/methods/page/
  * Page Kind: https://gohugo.io/methods/page/kind/
    * IsPage: https://gohugo.io/methods/page/ispage/
* The ".Site" object: https://gohugo.io/methods/site/
* Pass variables to partials: https://mertbakir.gitlab.io/hugo/pass-arguments-in-partials-hugo/
* Hugo functions: https://gohugo.io/functions/

To print a slice or map, use:

    <pre>{{ debug.Dump .Data }}</pre>

Or:

    <pre>{{ .Data | jsonify }}</pre>
