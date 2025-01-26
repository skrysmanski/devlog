import $ from "./jquery.module.js";
import { getContentRoot } from "./commons.module.js";

// This function makes sure the last section can be properly scrolled to (i.e. so that the last
// section's heading appears at the top of the page and thus gets properly highlighted in the TOC).
//
// NOTE: The footer sticks to the bottom of the page even without this method. This method just
//   increases the space between the last line of content and the footer.
function resizeEndOfPageMargin(contentRoot: JQuery<HTMLElement>) {
    const endOfPage = $('#dynamic-end-of-page');
    if (!endOfPage) {
        return;
    }

    // IMPORTANT: The elements used in this calculation MUST NOT get their height changed by this method - or else the
    //   calculation will produce unexpected/wrong results!!!! (Which, unfortunately, means that we can't increase the
    //   footer's height but have to use some element above the footer.)
    // NOTE: The "- 7" are just here to make sure you can't scroll down even further when jumping to the last section via the TOC.
    const mainViewHeight = window.innerHeight - $('#main-header')!.outerHeight(true)! - $('#main-footer')!.outerHeight(true)! - 7;

    // NOTE: Don't use "> section:last-child" because sections are nested into each other.
    let lastSection = $('section', contentRoot).last();
    if (lastSection.length == 0) {
        // This page has no sections. Use the whole page instead.
        lastSection = $('main.page');
    }
    const lastSectionHeight = lastSection.outerHeight(true)!;

    if (mainViewHeight > lastSectionHeight) {
        endOfPage.removeClass('hidden');
        $('#main-container').addClass('use-dynamic-end-of-page-margin');
        endOfPage.css('height', `${mainViewHeight - lastSectionHeight}px`);
    }
    else {
        $('#main-container').removeClass('use-dynamic-end-of-page-margin');
        endOfPage.addClass('hidden');
    }
}

export function initDynamicEndOfPageMargin() {
    const contentRoot = getContentRoot();
    resizeEndOfPageMargin(contentRoot);

    $(window).on('resize', () => {
        const contentRoot = getContentRoot();
        resizeEndOfPageMargin(contentRoot);
    });
};
