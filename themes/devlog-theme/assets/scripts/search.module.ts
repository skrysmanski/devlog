import $ from "./jquery.module.js";
import { showBackdrop, hideBackdrop } from "./backdrop.module.js";
import { registerGlobalKeyboardShortcut } from "./keyboard-shortcuts.module.js";

declare global {
    interface PagefindUIOptions {
        element?: string;
        showSubResults?: boolean;
        pageSize?: number;
        showImages?: boolean;
        resetStyles?: boolean;
        autofocus?: boolean;
    }

    class PagefindUI {
        constructor(options?: PagefindUIOptions);
    }
}

function getSearchBoxElement(): JQuery<HTMLElement> {
    return $('input.pagefind-ui__search-input');
}

function hideSearchOverlay() {
    $('#search-overlay-container').removeClass('visible');
    hideBackdrop();
}

function showSearchOverlay() : boolean {
    const $container = $('#search-overlay-container');
    if ($container.hasClass('visible')) {
        // Already visible
        return true;
    }

    $container.addClass('visible');
    getSearchBoxElement().trigger('focus'); // make sure the search box has the focus
    showBackdrop('page', hideSearchOverlay);

    return false;
}

export function initSearch() {
    //
    // Initializes the search box.
    //
    // See: https://pagefind.app/docs/ui/
    //
    // NOTE: To test this:
    //
    // 1. Run "hugo" to compile the site
    // 2. Run "npx pagefind --site "../../../public" (from the assets directory) to compile the search index
    // 3. Copy the directory "public/pagefind" to the site's "static" directory.
    //
    if (typeof PagefindUI !== 'undefined') {
        //
        // Create HTML for pagefind
        //
        new PagefindUI({
            element: "#search-overlay",
            // Don't show multiple results per page.
            showSubResults: false,
            // The number of search results to load at once, before a "Load more" button is shown.
            pageSize: 10,
            // We don't have images. No need to show any.
            showImages: false,
            // Removes any inline styles from the generated HTML elements.
            resetStyles: false,
            // NOTE: Unfortunately, "autofocus" doesn't work in our case (it won't auto focus).
            //   So, we have to keep setting the focus manually in "showSearchOverlay()".
            //autofocus: true
        });

        //
        // Improve search box
        //
        const $searchBox = getSearchBoxElement();
        // Replace placeholder text.
        $searchBox.attr('placeholder', 'Search content...')
        // iOS: Replace "search" with "done" as searching is done automatically (and not on hitting return).
        $searchBox.attr('enterkeyhint', 'done');
        // iOS: Close the virtual keyboard when hitting the "Done" button (unfortunately, this doesn't happen automatically).
        $searchBox.on('keyup', (e) => {
            if (e.key === 'Enter') {
                e.target.blur();
                e.preventDefault();
            }
        });
        // Add search icon.
        $searchBox.after('<i class="fa-solid fa-magnifying-glass search-icon"></i>');

        //
        // Improve clear button
        //
        const $clearButton = $('.pagefind-ui__search-clear');
        $clearButton.html('<i class="fa-solid fa-circle-xmark"></i>');
        $clearButton.attr('aria-label', 'Clear');
        $clearButton.attr('data-tooltip-dir', 'left');

        //
        // Wire up the search button in the header
        //
        $('#open-search-dialog-button').on('click', showSearchOverlay);

        //
        // Pressing the "." key opens the search UI
        //
        registerGlobalKeyboardShortcut('.', showSearchOverlay);
    }
}
