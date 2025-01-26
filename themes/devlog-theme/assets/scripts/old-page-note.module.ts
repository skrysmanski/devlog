import $ from "./jquery.module.js";

const PAGE_IS_OLD_MONTHS = 18;

export function renderOldContentNote() {
    const $oldPageNoteElement = $('div.old-page-note[data-page-date]');
    if (!$oldPageNoteElement) {
        return;
    }

    const pageDateAsString = $oldPageNoteElement.attr('data-page-date');
    if (!pageDateAsString) {
        return;
    }

    const pageDate = new Date(pageDateAsString);
    const today = new Date();

    const diffAsSeconds = (today.valueOf() - pageDate.valueOf()) / 1000;
    const diffAsHours = diffAsSeconds / 60 / 60;
    const diffAsMonths = diffAsHours / 24 / 30;

    if (diffAsMonths > PAGE_IS_OLD_MONTHS) {
        $oldPageNoteElement.html(
            `This page is <b>more than ${PAGE_IS_OLD_MONTHS} months old</b>. Since technology changes rapidly, this content <i>may</i> be out of date.`
        );
        $oldPageNoteElement.removeClass('hidden');
    }
}
