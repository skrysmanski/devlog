import $ from "./jquery.module.js";
import { registerGlobalKeyboardShortcut } from "./keyboard-shortcuts.module.js";

let backdropInitialized = false;
let currentBackdropCloseHandler: (() => void) | null = null;

function getBackdropElement(): JQuery<HTMLElement> {
    return $('#page-backdrop');
}

function onCloseBackdropEvent() : boolean {
    if (currentBackdropCloseHandler === null) {
        // Backdrop is either not currently visible or no close handler has been registered.
        // Either way, treat this as "not handled".
        return true;
    }

    currentBackdropCloseHandler();
    return false;
}

export function showBackdrop(backdropLayer: string = 'page', backdropCloseHandler: (() => void) | null = null) {
    const $backdropElement = getBackdropElement();
    $backdropElement.addClass('visible');
    $backdropElement.attr('data-backdrop-layer', backdropLayer);

    if (!backdropInitialized) {
        $backdropElement.on('click', onCloseBackdropEvent);
        registerGlobalKeyboardShortcut('Escape', onCloseBackdropEvent, 5);
        backdropInitialized = true;
    }

    currentBackdropCloseHandler = backdropCloseHandler;
}

export function toggleBackdrop(backdropLayer: string = 'page', backdropCloseHandler: (() => void) | null = null) {
    const $backdropElement = getBackdropElement();
    if ($backdropElement.hasClass('visible')) {
        hideBackdrop();
    }
    else {
        showBackdrop(backdropLayer, backdropCloseHandler);
    }
}

export function hideBackdrop() {
    const $backdropElement = getBackdropElement();
    $backdropElement.removeClass('visible');
    currentBackdropCloseHandler = null;
}
