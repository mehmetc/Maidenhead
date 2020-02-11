
export default class Maidenhead {
    private _lat: number | undefined;
    private _lon: number | undefined;
    private _precision: number = 5;
    private _locator: string | undefined;
    private __lat: number | undefined;
    private __lon: number | undefined;
    private __precision: number | undefined;

    constructor(lat?: number, lon?: number, precision: number = 5) {
        this.lat = lat;
        this.lon = lon;
        this.precision = precision;
    }

    static valid(locator: string) {
        if (typeof locator !== 'string') {
            return false;
        }

        if (locator.length < 2) {
            return false;
        }

        if ((locator.length % 2) !== 0) {
            return false;
        }

        var length = locator.length / 2;

        for (var counter = 0; counter < length; counter++) {
            var grid = locator.substr(counter * 2, 2);

            if (counter == 0) {
                if (grid.match(/[a-rA-R]{2}/) == null) {
                    return false;
                }
            } else if ((counter % 2) == 0) {
                if (grid.match(/[a-xA-X]{2}/) == null) {
                    return false;
                }
            } else {
                if (grid.match(/[0-9]{2}/) == null) {
                    return false;
                }
            }
            return true;
        }
    }

    static toLatLon(locator: string): [number, number] {
        var maidenhead = new Maidenhead();
        maidenhead.locator = locator;

        return [maidenhead.lat, maidenhead.lon];
    }

    distanceTo(other: Maidenhead, unit: 'km' | 'm' = 'km') {
        var r = 6371;

        switch (unit) {
            case 'm':
                r *= 1000;
        }

        var hn = this._deg_to_rad(this.lat);
        var he = this._deg_to_rad(this.lon);
        var n = this._deg_to_rad(other.lat);
        var e = this._deg_to_rad(other.lon);

        var co = Math.cos(he - e) * Math.cos(hn) * Math.cos(n) + Math.sin(hn) * Math.sin(n);
        var ca = Math.atan(Math.abs(Math.sqrt(1 - co * co) / co));

        if (co < 0) {
            ca = Math.PI - ca;
        }

        return r * ca;
    }

    bearingTo(other: Maidenhead): number {
        let hn = this._deg_to_rad(this.lat);
        let he = this._deg_to_rad(this.lon);
        let n = this._deg_to_rad(other.lat);
        let e = this._deg_to_rad(other.lon);

        let co = Math.cos(he - e) * Math.cos(hn) * Math.cos(n) + Math.sin(hn) * Math.sin(n);
        let ca = Math.atan(Math.abs(Math.sqrt(1 - co * co) / co));

        if (co < 0) {
            ca = Math.PI - ca
        }

        let si = Math.sin(e - he) * Math.cos(n) * Math.cos(hn);
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

        return Math.round(this._rad_to_deg(az));
    }

    compassBearingTo(other: Maidenhead): string {
        const heading = this.bearingTo(other);

        return this._compass_bearing(heading);
    }

    get lat(): number {
        return parseFloat(this._lat.toPrecision(6));
    }

    set lat(pos: number) {
        this._lat = this._range_check("lat", 90.0, pos)
    }

    get lon(): number {
        return parseFloat(this._lon.toPrecision(6));
    }

    set lon(pos: number) {
        this._lon = this._range_check("lon", 180.0, pos)
    }

    get precision(): number {
        return this._precision;
    }

    set precision(p: number) {
        this._precision = p;
    }

    set locator(value: string) {
        if (!Maidenhead.valid(value)) {
            throw "Location is not a valid Maidenhead Locator System string";
        }

        this._locator = value;
        this._lat = -90.00;
        this._lon = -180.00;

        this._pad_locator();

        this._convert_part_to_latlon(0, 1);
        this._convert_part_to_latlon(1, 10);
        this._convert_part_to_latlon(2, 10 * 24);
        this._convert_part_to_latlon(3, 10 * 24 * 10);
        this._convert_part_to_latlon(4, 10 * 24 * 10 * 24);
    }

    get locator(): string {
        this._locator = '';
        this.__lat = this.lat + 90.0;
        this.__lon = this.lon + 180.0;
        this.__precision = this.precision;


        this._calculate_field();
        this._calculate_values();

        return this._locator;
    }

    private _compass_bearing(heading: number): string {
        if (heading >= 0 && heading <= 360) {
            var compassBearings = [
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

            var result = compassBearings.find(element => {
                if (heading > element.start && heading < element.end) {
                    return true;
                }
                return false;
            });

            return result ? result.label : '';
        }

        return '';
    }

    private _deg_to_rad(deg: number): number {
        return deg / 180 * Math.PI;
    }

    private _rad_to_deg(rad: number): number {
        return rad / Math.PI * 180;
    }

    private _pad_locator(): void {
        var length = this._locator.length / 2;

        while (length < 5) {
            if ((length % 2) == 1) {
                this._locator += '55';
            }
            else {
                this._locator += 'LL';
            }

            length = this._locator.length / 2;
        }
    }

    private _range_check(target: string, range: number, pos: number): number {
        pos = Number(pos);
        if (pos < -range || pos > range) {
            throw target + " must be between -" + range + " and +" + range;
        }

        return pos;
    }

    private _convert_part_to_latlon(counter: number, divisor: number): void {
        var grid_lon = this._locator.substr(counter * 2, 1);
        var grid_lat = this._locator.substr(counter * 2 + 1, 1);

        this._lat += this._l2n(grid_lat) * 10.0 / divisor;
        this._lon += this._l2n(grid_lon) * 20.0 / divisor;
    }

    private _calculate_field(): void {
        this.__lat = (this.__lat / 10) + 0.0000001;
        this.__lon = (this.__lon / 20) + 0.0000001;
        this._locator += this._n2l(Math.floor(this.__lon)).toUpperCase() + this._n2l(Math.floor(this.__lat)).toUpperCase();
        this.__precision -= 1;
    }

    private _calculate_values(): void {
        for (let counter = 0; counter < this.__precision; counter++) {
            if ((counter % 2) == 0) {
                this._compute_locator(counter, 10);
            } else {
                this._compute_locator(counter, 24);
            }
        }
    }

    private _compute_locator(counter: number, divisor: number): void {
        this.__lat = (this.__lat - Math.floor(this.__lat)) * divisor;
        this.__lon = (this.__lon - Math.floor(this.__lon)) * divisor;

        if ((counter % 2) == 0) {
            this._locator += "" + Math.floor(this.__lon) + "" + Math.floor(this.__lat)
        } else {
            this._locator += this._n2l(Math.floor(this.__lon)) + this._n2l(Math.floor(this.__lat))
        }
    }

    private _l2n(letter: string): number {
        if (letter.match(/[0-9]+/)) {
            return parseInt(letter);
        } else {
            return letter.toLowerCase().charCodeAt(0) - 97;
        }
    }

    private _n2l(number: number): string {
        return String.fromCharCode(97 + number);
    }
}