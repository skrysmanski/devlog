import $ from "./jquery.module.js";

const today = new Date();
const todayAsString = today.toDateString();

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const yesterday = new Date(today.valueOf() - DAY_IN_MS);
const yesterdayAsString = yesterday.toDateString();

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function formatDoubleDigitNumber(number : number) : string {
    if (number < 10) {
        return `0${number.toFixed(0)}`;
    }
    else {
        return number.toFixed(0);
    }
}

function formatNumberWithUnit(number : number, oneUnit: string, manyUnit : string) : string {
    let numberAsString = Math.round(number).toFixed(0);

    if (numberAsString == "1") {
        return "1 " + oneUnit;
    }
    else {
        return numberAsString + " " + manyUnit;
    }
}

function convertDateToDateAgo(date : Date) : string {
    const dateAsString = date.toDateString();

    if (dateAsString == todayAsString) {
        return 'Today';
    }
    if (dateAsString == yesterdayAsString) {
        return 'Yesterday';
    }

    const diffAsSeconds = (today.valueOf() - date.valueOf()) / 1000;
    const diffAsHours = diffAsSeconds / 60 / 60;
    if (diffAsHours < 36) {
        return formatNumberWithUnit(diffAsHours, "hour", "hours") + " ago";
    }

    const diffAsDays = diffAsHours / 24;
    if (diffAsDays < 45) {
        return formatNumberWithUnit(diffAsDays, "day", "days") + " ago";
    }

    const diffAsMonths = diffAsDays / 30;
    if (diffAsMonths < 15) {
        return formatNumberWithUnit(diffAsMonths, "month", "months") + " ago";
    }

    const diffAsYears = diffAsDays / 365;
    return formatNumberWithUnit(diffAsYears, "year", "years") + " ago";
}

export function renderDates() {
    $('[data-date]').each((_, dateElement) => {
        const date = new Date(dateElement.getAttribute('data-date')!);

        let dateAsString : string;

        const dateConversionType = dateElement.getAttribute('data-date-type');
        if (dateConversionType === "date-ago") {
            dateAsString = convertDateToDateAgo(date);
        }
        else {
            dateAsString = `${date.getDate()}. ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
        }

        const dateTargetAttribute = dateElement.getAttribute('data-date-target-attrib');
        if (dateTargetAttribute) {
            dateElement.setAttribute(dateTargetAttribute, dateAsString);
        }
        else {
            dateElement.innerText = dateAsString;
        }
    });
}
