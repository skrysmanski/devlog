// Based on: https://aaronluna.dev/blog/add-copy-button-to-code-blocks-hugo-chroma/
const BUTTON_DEFAULT_HTML = '<i class="fa-regular fa-copy"></i>';
const BUTTON_DEFAULT_TOOLTIP = 'Copy this code block.';
const BUTTON_COPIED_HTML = '<i class="fa-solid fa-check"></i>';
const BUTTON_COPIED_TOOLTIP = 'Copied!';

function createCopyButton(highlightDiv: HTMLElement) {
    const button = document.createElement("button");

    button.className = "copy-code-button hide-in-print";
    button.type = "button";
    button.innerHTML = BUTTON_DEFAULT_HTML;
    button.addEventListener("click", () => copyCodeToClipboard(button, highlightDiv));

    button.setAttribute('aria-label', BUTTON_DEFAULT_TOOLTIP);
    button.setAttribute('data-tooltip-dir', 'left');

    highlightDiv.insertBefore(button, highlightDiv.firstChild);
}

async function copyCodeToClipboard(button: HTMLButtonElement, highlightDiv: HTMLElement) {
    // NOTE: We use "textContent" instead of "innerText" here as "innerText" adds
    //   an additional empty line for each line - which is not what we want.
    const codeToCopy = highlightDiv.querySelector("code:last-child")!.textContent!;

    try {
        navigator.clipboard.writeText(codeToCopy);
    }
    finally {
        codeWasCopied(button);
    }
}

function codeWasCopied(button: HTMLButtonElement) {
    button.blur();
    button.innerHTML = BUTTON_COPIED_HTML;
    button.setAttribute('aria-label', BUTTON_COPIED_TOOLTIP);

    setTimeout(
        () => {
            button.innerHTML = BUTTON_DEFAULT_HTML;
            button.setAttribute('aria-label', BUTTON_DEFAULT_TOOLTIP);
        },
        2000
    );
}

export function initCopyButtons() {
    document
        .querySelectorAll("pre")
        .forEach((highlightDiv) => createCopyButton(highlightDiv));
};
