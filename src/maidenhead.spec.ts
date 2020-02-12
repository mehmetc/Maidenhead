import Maidenhead from "./maidenhead";

describe("Maidenhead", () => {
    it("valid", () => {
        expect(Maidenhead.valid("FN")).toBe(true);
        expect(Maidenhead.valid("FN31")).toBe(true);
        expect(Maidenhead.valid("FN31pr")).toBe(true);
        expect(Maidenhead.valid("$%^#$%#$%")).toBe(false);
        expect(Maidenhead.valid("FNXX")).toBe(false);

        // case insensitive
        expect(Maidenhead.valid("fn")).toBe(true);
        expect(Maidenhead.valid("fn31")).toBe(true);
        expect(Maidenhead.valid("fn31PR")).toBe(true);
        expect(Maidenhead.valid("fnxx")).toBe(false);
    });

    it("toLatLon", () => {
        const fn31 = Maidenhead.toLatLon("FN31");

        expect(fn31[0]).toEqual(41.5);
        expect(fn31[1]).toEqual(-73);

        const fn31pr = Maidenhead.toLatLon("FN31pr");

        expect(fn31pr[0]).toBeCloseTo(41.729167, 3);
        expect(fn31pr[1]).toBeCloseTo(-72.708333, 3);

        const jn58td = Maidenhead.toLatLon("JN58td");

        expect(jn58td[0]).toBeCloseTo(48.145833, 3);
        expect(jn58td[1]).toBeCloseTo(11.625, 3);

        const gf15vc = Maidenhead.toLatLon("GF15vc");

        expect(gf15vc[0]).toBeCloseTo(-34.895833, 3);
        expect(gf15vc[1]).toBeCloseTo(-56.208333, 3);

        const fm18lw = Maidenhead.toLatLon("FM18lw");

        expect(fm18lw[0]).toBeCloseTo(38.9375, 3);
        expect(fm18lw[1]).toBeCloseTo(-77.041667, 3);

        const re78ir = Maidenhead.toLatLon("RE78ir");

        expect(re78ir[0]).toBeCloseTo(-41.270833, 3);
        expect(re78ir[1]).toBeCloseTo(174.708333, 3);
    });

    it("distanceTo", () => {
        const fn31pr = Maidenhead.fromLocator("FN31pr");

        const re78ir = Maidenhead.fromLocator("RE78ir");

        const distanceKm = fn31pr.distanceTo(re78ir, 'km');
        const distanceM = fn31pr.distanceTo(re78ir, 'm');

        expect(distanceKm).toBeCloseTo(14553, 0);
        expect(distanceM).toBeCloseTo(14553053, 0);
    });

    it("fromGridCode", () => {
        const fn31pr = Maidenhead.fromLocator("FN31pr");

        expect(fn31pr).toBeDefined();
        expect(fn31pr.locator).toEqual("FN31pr");
    });

    it("fromCoordinates", () => {
        const fn31pr = Maidenhead.fromCoordinates(41.729167, -72.708333);

        expect(fn31pr.locator).toEqual("FN31pr");
    });

    it("bearingTo", () => {
        const fn31pr = Maidenhead.fromLocator("FN31pr");

        const re78ir = Maidenhead.fromLocator("RE78ir");

        const bearing = re78ir.bearingTo(fn31pr);

        expect(bearing).toBeCloseTo(65.7, 0);
    });

    it("compassBearingTo", () => {
        const fn31pr = Maidenhead.fromLocator("FN31pr");

        const re78ir = Maidenhead.fromLocator("RE78ir");

        const bearing = re78ir.compassBearingTo(fn31pr);

        expect(bearing).toEqual("ENE");
    });

    it("get locator with precision", () => {
        const fn31pr = new Maidenhead(41.729167, -72.708333, 3);

        expect(fn31pr.locator).toEqual("FN31pr");

        const fn31 = new Maidenhead(41.729167, -72.708333, 2);

        expect(fn31.locator).toEqual("FN31");
    });
});