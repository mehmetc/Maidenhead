const compassBearings = [
    { label: "N", start: 0, end: 11 },
    { label: "NNE", start: 11, end: 33 },
    { label: "NE", start: 34, end: 56 },
    { label: "ENE", start: 57, end: 78 },
    { label: "E", start: 79, end: 101 },
    { label: "ESE", start: 102, end: 123 },
    { label: "SE", start: 124, end: 146 },
    { label: "SSE", start: 147, end: 168 },
    { label: "S", start: 169, end: 191 },
    { label: "SSW", start: 192, end: 213 },
    { label: "SW", start: 214, end: 236 },
    { label: "WSW", start: 237, end: 258 },
    { label: "W", start: 259, end: 281 },
    { label: "WNW", start: 282, end: 303 },
    { label: "NW", start: 304, end: 326 },
    { label: "NNW", start: 327, end: 348 },
    { label: "N", start: 349, end: 360 }
];

export function compassBearing(heading: number): string {
    if (heading >= 0 && heading <= 360) {
        const result = compassBearings.find(element => {
            if (heading > element.start && heading < element.end) {
                return true;
            }
            return false;
        });

        return result ? result.label : '';
    }

    return '';
}

export function degreesToRadians(deg: number): number {
    return deg / 180 * Math.PI;
}

export function radiansToDegrees(rad: number): number {
    return rad / Math.PI * 180;
}

export function letterToNumber(letter: string): number {
    if (letter.match(/[0-9]+/)) {
        return parseInt(letter);
    } else {
        return letter.toLowerCase().charCodeAt(0) - 97;
    }
}

export function numberToLetter(number: number): string {
    return String.fromCharCode(97 + number);
}

export function rangeCheck(target: string, range: number, pos: number): number {
    pos = Number(pos);

    if (pos < -range || pos > range) {
        throw target + " must be between -" + range + " and +" + range;
    }

    return pos;
}