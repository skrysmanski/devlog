import $ from "./jquery.module.js";
import { registerGlobalKeyboardShortcut } from "./keyboard-shortcuts.module";

const TARGET_CLEARED_CLASS = 'target-cleared';
let targetClearedClassAdded = false;

//
// Change "top links" so that they don't leave an anchor in the URL.
//
function simplifyTopLinks() {
    const $topLinks = $('a[href="#top"]');
    if ($topLinks.length > 0) {
        $topLinks.attr('href', '');
        $topLinks.on('click', () => {
            clearUrlAnchor();
            $("#top")[0].scrollIntoView();
            return false;
        });
    }
}

//
// Clears the currently selected anchor in the URL (as shown in the location bar) -
// WITHOUT scrolling to the top.
//
function clearUrlAnchor() : boolean {
    if (!location.hash) {
        return true;
    }

    // NOTE: Don't clear "location.hash" here as this will result in a scroll to the top (and also
    //   will result in a trailing # in the URL location bar).
    history.pushState("", "", window.location.pathname + window.location.search);

    // NOTE: We need to manually add this class because the method above unfortunately doesn't clear
    //   the ":target" CSS selector.
    $(':target').addClass(TARGET_CLEARED_CLASS);
    targetClearedClassAdded = true;

    return false;
}

function clearAnchorRemovedClasses() {
    if (targetClearedClassAdded) {
        $(`.${TARGET_CLEARED_CLASS}`).removeClass(TARGET_CLEARED_CLASS);
        targetClearedClassAdded = false;
    }
}

export function initAnchorManagementModule() {
    simplifyTopLinks();

    // Clear the URL anchor if the user hits ESC
    registerGlobalKeyboardShortcut('Escape', clearUrlAnchor, -5);

    // Clear the URL anchor if the user clicks the highlighted header
    // NOTE: I once tried to add a "click" handler here so that the anchor is cleared when the
    //   user clicks anywhere on some whitespace - but there doesn't seem to be a good way to do this
    //   (the click event was fired even for drag&drop operations and when links were clicked).
    //   So clicking on the highlighted header is a good compromise.
    $('#page-content').on('click', 'section:target > :header', function() {
        clearUrlAnchor();
        return true; // never mark this event as "handled" (it should not prevent any other click related functionality)
    });

    window.addEventListener('hashchange', clearAnchorRemovedClasses);
}
