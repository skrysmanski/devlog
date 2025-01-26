import $ from "./jquery.module.js";

export function getContentRoot() : JQuery<HTMLElement> {
    return $('main.page #page-content');
}
