import $ from "./jquery.module.js";
import { initImprovedToc } from "./toc.module.js";
import { initDynamicEndOfPageMargin } from "./dynamic-end-of-page-margin.module.js";
import { initCopyButtons } from "./code-copy-button.module.js";
import { initAutoMenuClose } from "./popup-menu.module.js";
import { initReadingProgressBar } from "./reading-progress.module.js";
import { initSearch } from "./search.module.js";
import { renderDates } from "./date-time-utils.module.js";
import { initAnchorManagementModule } from "./anchor-management.module.js";
import { renderOldContentNote } from "./old-page-note.module.js";
import { enhanceAllCodeBlocks } from "./syntax-highlighting.module.js";

//
// Adds the "standalone" class to all images that are don't have any surrounding text.
//
// NOTE: This is necessary because Hugo doesn't allows us to differentiate between inline and
//   block images and also because there seem to be no way of differentiating between these two
//   in CSS. This seemingly promising ":only-child" selector doesn't take text into account
//   (see https://stackoverflow.com/q/38259813/614177).
//
function detectStandaloneImages() {
    function isNonEmptyTextNode(this: HTMLElement | Document | Text | Comment) : boolean {
        return this.nodeType === Node.TEXT_NODE
            && !!this.textContent
            && this.textContent.trim().length > 0;
    }

    $('.figure').each((_, figureElement) => {
        const parentElement = figureElement.parentElement;
        if (!parentElement) {
            return;
        }

        const isOnlyChild = parentElement.childElementCount === 1;
        if (isOnlyChild) {
            // This element is the only child element.
            // NOTE: Even if it's the only child element, it may still be surrounded by text nodes.
            //   So we have to check for them next.
            const isStandalone = $(parentElement).contents().filter(isNonEmptyTextNode).length === 0;
            if (isStandalone) {
                $(figureElement).addClass('standalone');
            }
        }
    });
}

//
// "Main" function. Executed when the "ready" event is triggered.
//
// NOTE: The page is often already visible to the user when this function is executed.
//   If you need to do something before the page is visible, use "fixupHtmlBeforeShow()"
//   instead.
//
function onPageIsLoaded() {
    initImprovedToc();
    initDynamicEndOfPageMargin();
    initCopyButtons();
    initAutoMenuClose();

    // NOTE: While we would ideally have this in fixupHtmlBeforeShow(), the problem is that
    //   the content height isn't correct at this point (leading to a wrongly calculated
    //   reading progress). So we leave it here.
    initReadingProgressBar();

    initAnchorManagementModule();
    initSearch();
}

//
// Fixes up the HTML content before it's displayed to the user.
//
// NOTE: The browser's render process is halted until this method has returned. Thus, it should
//   be quick to execute and should only contain code that alters the page's content in a way
//   that's **visible on page load**.
//
// NOTE: Unlike "onPageIsLoaded()", this function is executed before(!) the page is
//   shown to the user.
//
function fixupHtmlBeforeShow() {
    renderDates();
    detectStandaloneImages();
    renderOldContentNote();
    enhanceAllCodeBlocks();
}

// Execute when DOM is loaded. https://api.jquery.com/ready/
$(onPageIsLoaded);

// Export fixupHtmlBeforeShow() so that it can be called from a script tag.
(<any>window).fixupHtmlBeforeShow = fixupHtmlBeforeShow;
