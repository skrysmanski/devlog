interface GlobalKeyboardShortcutOptions {
    requireCtrl?: boolean;
    requireShift?: boolean;
    requireMeta?: boolean;
}

type KeyboardShortcutEventHandlerWrapper = (event : KeyboardEvent) => boolean;

let keyUpEventRegistered = false;
let priorityEventListeners = new Map<number, KeyboardShortcutEventHandlerWrapper[]>();

function onKeyUp(event : KeyboardEvent) {
    if (event.isComposing) {
        // Ignore CJKT composing.
        // See: https://developer.mozilla.org/en-US/docs/Web/API/Element/keyup_event
        return;
    }

    if (event.target instanceof HTMLElement && event.target.localName?.toLocaleLowerCase() === 'input') {
        // User is typing in an input field. Don't treat these as global shortcuts.
        return;
    }

    for (const [_, eventHandlers] of priorityEventListeners) {
        for (const eventHandler of eventHandlers) {
            if (!eventHandler(event)) {
                // Event has been handled.
                // NOTE: We follow the jQuery convention here that "false" means "handled"
                //   and "true" means "not handled" (even though I think it should be the
                //   other way around).
                event.stopImmediatePropagation();
                event.preventDefault();
                return;
            }
        }
    }
}

export function registerGlobalKeyboardShortcut(key: string, eventHandler: () => boolean, priority?: number, options?: GlobalKeyboardShortcutOptions) {
    if (!keyUpEventRegistered) {
        document.addEventListener('keyup', onKeyUp);
        keyUpEventRegistered = true;
    }

    let eventHandlersForPriority = priorityEventListeners.get(priority ?? 0);
    if (!eventHandlersForPriority) {
        eventHandlersForPriority = [];
        priorityEventListeners.set(priority ?? 0, eventHandlersForPriority);
        // Sort map by priority so that it can be iterated in the correct order (higher numbers first).
        // NOTE: This works because "Map" is iterated in the order in which the elements were added.
        priorityEventListeners = new Map([...priorityEventListeners.entries()].sort(function (a, b) { return b[0] - a[0] }));
    }

    const requireCtrl = options?.requireCtrl === true;
    const requireShift = options?.requireShift === true;
    const requireMeta = options?.requireMeta === true;

    const eventHandlerWrapper : KeyboardShortcutEventHandlerWrapper = function (event) {
        if (event.key !== key) {
            return true;
        }

        if (event.ctrlKey !== requireCtrl || event.shiftKey !== requireShift || event.metaKey !== requireMeta) {
            // Modifier keys don't match.
            return true;
        }

        return eventHandler();
    };

    eventHandlersForPriority.push(eventHandlerWrapper);
}
