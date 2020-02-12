import { 
    degreesToRadians, 
    radiansToDegrees, 
    compassBearing, 
    rangeCheck, 
    letterToNumber, 
    numberToLetter 
} from "./util";

const locatorRegex = /^[A-R]{2}(([0-9]{2})([A-X]{2})?)?$/i;

export default class Maidenhead {
    private _lat: number | undefined;
    private _lon: number | undefined;
    private _precision: number = 3;
    private _locator: string | undefined;
    
    constructor(lat?: number, lon?: number, precision: number = 3) {
        this.latitude = lat;
        this.longitude = lon;
        this.precision = precision;
    }

    /**
     * Validates that a grid code is a valid code.
     * @param locator The grid code to validate.
     * @returns Returns true if valid, false if invalid.
     */
    static valid(locator: string) {
        return locatorRegex.test(locator);
    }

    /**
     * Calculates the center point of the grid square as latitude/longitude.
     * @param locator The grid code locator to convert to latitude/longitude
     * @returns Returns an array of length 2 with [latitude, longitude] values.
     */
    static toLatLon(locator: string): [number, number] {
        const maidenhead = Maidenhead.fromLocator(locator);
        return [maidenhead.latitude, maidenhead.longitude];
    }

    /**
     * Creates a new Maidenhead instance from the given grid locator code.
     * @param locator The grid locator code.
     * @param precision The precision of the locator.
     * @returns Returns a new Maidenhead instance for the given grid code.
     */
    static fromLocator(locator: string, precision?: number): Maidenhead {
        const maidenhead = new Maidenhead(undefined, undefined, precision || (locator.length / 2));
        maidenhead.locator = locator;
        return maidenhead;
    }

    /**
     * Creates a new Maidenhead instance from the given latitude and longitude.
     * @param latitude The latitude of the position.
     * @param longitude The longitude of the position.
     * @param precision The precision of the locator.
     */
    static fromCoordinates(latitude: number, longitude: number, precision: number = 3) {
        return new Maidenhead(latitude, longitude, precision);
    }

    /**
     * Calculates the distance between this point and another point.
     * @param other The other point to calculate the distance to.
     * @param unit The unit of distance in either "km" or "m".
     * @returns Returns the distance between the two points in the specified unit.
     */
    distanceTo(other: Maidenhead, unit: 'km' | 'm' = 'km'): number {
        let r = 6371;

        switch (unit) {
            case 'm':
                r *= 1000;
        }

        const hn = degreesToRadians(this.latitude);
        const he = degreesToRadians(this.longitude);
        const n = degreesToRadians(other.latitude);
        const e = degreesToRadians(other.longitude);

        const co = Math.cos(he - e) * Math.cos(hn) * Math.cos(n) + Math.sin(hn) * Math.sin(n);
        let ca = Math.atan(Math.abs(Math.sqrt(1 - co * co) / co));

        if (co < 0) {
            ca = Math.PI - ca;
        }

        return r * ca;
    }

    /**
     * Calculates the bearing from this point to another point.
     * @param other The other point to calculate the bearing to.
     * @returns Returns the bearing to the other location in degrees.
     */
    bearingTo(other: Maidenhead): number {
        const hn = degreesToRadians(this.latitude);
        const he = degreesToRadians(this.longitude);
        const n = degreesToRadians(other.latitude);
        const e = degreesToRadians(other.longitude);

        let co = Math.cos(he - e) * Math.cos(hn) * Math.cos(n) + Math.sin(hn) * Math.sin(n);
        let ca = Math.atan(Math.abs(Math.sqrt(1 - co * co) / co));

        if (co < 0) {
            ca = Math.PI - ca
        }

        const si = Math.sin(e - he) * Math.cos(n) * Math.cos(hn);
        co = Math.sin(n) - Math.sin(hn) * Math.cos(ca);
        let az = Math.atan(Math.abs(si / co));

        if (co < 0) {
            az = Math.PI - az;
        }

        if (si < 0) {
            az = -az;
        }

        if (az < 0) {
            az = az + 2 * Math.PI;
        }

        return Math.round(radiansToDegrees(az));
    }

    /**
     * Calculates the compass bearing (i.e. "NNW") from this point to another point.
     * @param other The other point to calculate the bearing to.
     * @returns Returns the compass bearing string.
     */
    compassBearingTo(other: Maidenhead): string {
        const heading = this.bearingTo(other);

        return compassBearing(heading);
    }

    /**
     * Gets the latitude of this locator.
     */
    get latitude(): number {
        return parseFloat(this._lat.toPrecision(6));
    }

    /**
     * Sets the latitude of this locator.
     */
    set latitude(pos: number) {
        this._lat = rangeCheck("lat", 90.0, pos);
        this._locator = null;
    }

    /**
     * Gets the longitude of this locator.
     */
    get longitude(): number {
        return parseFloat(this._lon.toPrecision(6));
    }

    /**
     * Sets the longitude of this locator.
     */
    set longitude(pos: number) {
        this._lon = rangeCheck("lon", 180.0, pos);
        this._locator = null;
    }

    /**
     * Gets the precision of this locator.
     */
    get precision(): number {
        return this._precision;
    }

    /**
     * Sets the precision of this locator.
     */
    set precision(p: number) {
        if (p < 1 || p > 5) {
            throw "Precision value must be in the range of 1 to 5.";
        }

        this._precision = p;
        this._locator = null;
    }

    /**
     * Sets the grid locator code of this position.
     */
    set locator(value: string) {
        if (!Maidenhead.valid(value)) {
            throw "Location is not a valid Maidenhead Locator System string";
        }

        this._locator = value;
        this._precision = value.length / 2;

        const [ lat, lon ] = Maidenhead.gridCodeToCoordinates(value);

        this._lat = lat;
        this._lon = lon;
    }

    /**
     * Gets the grid locator code of this position.
     */
    get locator(): string {
        if (this._locator && this._locator.length) {
            return this._locator;
        }

        this._locator = Maidenhead.coordinatesToGridCode(this.latitude, this.longitude, this.precision);

        return this._locator;
    }

    private static gridCodeToCoordinates(locator: string): [number, number] {
        let lat = -90.00;
        let lon = -180.00;

        for (let counter = 0; counter < (locator.length / 2); counter++) {
            let divisor;

            switch (counter) {
                case 0:
                    divisor = 1;
                    break;
                case 1:
                    divisor = 10;
                    break;
                case 2:
                    divisor = 10 * 24;
                    break;
                case 3:
                    divisor = 10 * 24 * 10;
                    break;
                case 4:
                    divisor = 10 * 24 * 10 * 24;
            }

            const [lat2, lon2] = Maidenhead._convert_part_to_latlon(locator, counter, divisor);
            lat += lat2;
            lon += lon2;
        }

        return [lat, lon];
    }

    private static _convert_part_to_latlon(locator: string, counter: number, divisor: number): [number, number] {
        let midpoint = 0;

        if (locator.length < (counter + 1) * 2) {
            return;
        } else if (locator.length === (counter + 1) * 2) {
            midpoint = 0.5;
        }

        const grid_lon = locator.substr(counter * 2, 1);
        const grid_lat = locator.substr(counter * 2 + 1, 1);

        const lat = (letterToNumber(grid_lat) + midpoint) * 10.0 / divisor;
        const lon = (letterToNumber(grid_lon) + midpoint) * 20.0 / divisor;

        return [lat, lon];
    }

    /**
     * Converts coordinates to a maidenhead grid code.
     * @param latitude The latitude of the coordinate.
     * @param longitude The longitude of the coordinate.
     * @param precision The precision of the grid code, in the range 1-5. Defaults to 3 for a 6-character code.
     * @returns Returns the grid code, twice the length of the specified precision.
     */
    static coordinatesToGridCode(latitude: number, longitude: number, precision: number = 3): string {
        let lat = ((latitude + 90.0) / 10) + 0.0000001;
        let lon = ((longitude + 180.0) / 20) + 0.0000001;

        let locator = numberToLetter(Math.floor(lon)).toUpperCase() + numberToLetter(Math.floor(lat)).toUpperCase();

        for (let counter = 0; counter < precision - 1; counter++) {
            const divisor = (counter % 2) === 0 ? 10 : 24;
            
            lat = (lat - Math.floor(lat)) * divisor;
            lon = (lon - Math.floor(lon)) * divisor;
            
            if ((counter % 2) == 0) {
                locator += Math.floor(lon).toString() + Math.floor(lat).toString();
            } else {
                locator += numberToLetter(Math.floor(lon)) + numberToLetter(Math.floor(lat));
            }
        }

        return locator;
    }
}