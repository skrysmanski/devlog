const { glob } = require('glob');
const fs = require('fs').promises;
const path = require('path');
const beautify = require('js-beautify');

async function beautifyHtmlFiles(rootPath) {
    console.log('Beautifying HTML files...');
    console.log();

    const htmlFilePaths = await glob(`${rootPath}/**/*.html`);

    // See: https://www.npmjs.com/package/js-beautify?activeTab=readme#css--html
    const beautifyOptions = {
        "indent_size": 2,
        "space_in_empty_paren": true,
        "end_with_newline": true,
        "max_preserve_newlines": 1,
        // NOTE: We exclude <script> from reformatting to not break CSP hashes.
        "content_unformatted": [ 'pre', 'script' ],
        "extra_liners": [ 'head', '/head', 'body', '/body', 'p', 'table' ],
    };

    const beautifyHtmlPromises = htmlFilePaths.map(async (filePath) => {
        const fileContents = await fs.readFile(filePath, { encoding: 'utf8' });

        let beautifiedHtml = beautify.html(fileContents, beautifyOptions);

        // Unescape some uselessly escaped characters.
        beautifiedHtml = beautifiedHtml.replaceAll('&#39;', "'")
                                       .replaceAll('&#43;', "+")
                                       .replaceAll('&#34;', "&quot;");

        fs.writeFile(filePath, beautifiedHtml, { encoding: 'utf8' });

        console.log(`Beautified: ${filePath}`);
    });

    await Promise.all(beautifyHtmlPromises);
}

(async () => {
    let rootPath = process.argv[2];
    if (!rootPath) {
        throw 'Missing parameter';
    }

    rootPath = path.resolve(rootPath);
    console.log(`Beautifying files in: ${rootPath}`);
    console.log();

    // NOTE: We only beautify HTML files. JavaScript and CSS files can't be beautified because
    //   this would break their integrity hashes.
    await beautifyHtmlFiles(rootPath);
})();
