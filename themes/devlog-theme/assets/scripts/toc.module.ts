import $ from "./jquery.module.js";
import { getContentRoot } from "./commons.module.js";
import { toggleBackdrop } from "./backdrop.module.js";

// The section that's located at the page's height in percent will be highlighted in the ToC.
const tocHighlightedSectionPositionInPercent = 20;

function toggleSlideOutToc() {
    $('.toc-toggle-button').toggleClass('is-expanded');
    $('#page-toc').toggleClass('is-expanded');
    toggleBackdrop('content', hideSlideOutToc);
}

function hideSlideOutToc() {
    if ($('#page-toc').hasClass('is-expanded')) {
        toggleSlideOutToc();
    }
}

export function initImprovedToc() {
    const tocElement = $('nav#TableOfContents');

    function findTocLinkForId(id: string): JQuery<HTMLElement> {
        // NOTE: This query selector return null if the TOC doesn't contain the heading level of this section (e.g. the TOC
        //   only contains level 2 and 3, but this section belongs to a <h4>).
        return $(`a[href="#${id}"]`, tocElement);
    }

    let observer: IntersectionObserver | null;

    if (tocElement.length > 0) {
        observer = new IntersectionObserver(
            entries => {
                // NOTE: "entries" includes one entry for each target which reported a change in its intersection status.
                // NOTE: Type for "entry" is IntersectionObserverEntry: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry
                entries.forEach(entry => {
                    const tocLinkForId = findTocLinkForId(entry.target.id);
                    if (entry.isIntersecting) {
                        tocLinkForId.attr('aria-current', 'true');
                    } else {
                        tocLinkForId.removeAttr('aria-current');
                    }
                });
            },
            // NOTE: The "rootMargin" setting is a trick so that always only one section is marked as "current"
            //   (namely the one at about 10% of the screen's height). Otherwise, multiple sections would be marked as "current"
            //   - which would be technically correct but the usability was worse than if only one section is used.
            // NOTE 2: Margins must be negative so that they move "inwards".
            { rootMargin: `-${tocHighlightedSectionPositionInPercent}% 0px -${100 - tocHighlightedSectionPositionInPercent}%` }
        );
    }
    else {
        observer = null;
    }

    // Wrap all "sections" (starting with a heading and going until the next heading) into an actual <section>
    // element and transfer the id from the heading to the section.
    const contentRoot = getContentRoot();
    for (let level = 1; level <= 6; level++) {
        $(`h${level}[id]`, contentRoot).each(function() {
            const id = this.id;
            // For performance reasons, we only create sections and observers for headings that actually have a link
            // in the page's TOC.
            if (tocElement && !findTocLinkForId(id)) {
                return;
            }

            this.removeAttribute('id');

            const section = $(this).nextUntil(`h${level}[id]`).addBack().wrapAll(`<section id="${id}">`).parent();

            if (observer) {
                // NOTE: The "[0]" is to get the underlying DOM element from the jquery object.
                observer.observe(section[0]);
            }
        });
    }

    // For slide out ToC on mobile (small screens)
    $('.toc-toggle-button').on('click', toggleSlideOutToc);
    $('#page-toc a').on('click', hideSlideOutToc);
};

