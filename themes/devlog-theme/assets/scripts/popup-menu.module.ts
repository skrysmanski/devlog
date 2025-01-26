import $ from "./jquery.module.js";

export function initAutoMenuClose() {
    //
    // Closes popup menus if the user clicks (outside).
    // NOTE: We need to use $(document) instead of $(window) here or it won't work on iOS.
    //   See also: https://stackoverflow.com/questions/43335183/window-click-event-does-not-fire-on-ios-safari-javascript-only
    //
    $(document).on('click', (e) => {
        $('.popup-menu.auto-close > input[type=checkbox].menu-state:checked').each((_, value) => {
            // NOTE: This condition is important because:
            // * Without it, if the user tries to open the menu, it would close again immediately.
            // * Without it, the menu would not close if the user clicks the "open button" again.
            if (<any>e.target !== value && $(e.target).prop('for') != value.id) {
                $(value).prop('checked', false);
            }
        });
    });
};
