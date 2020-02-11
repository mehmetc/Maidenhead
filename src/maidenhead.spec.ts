import Maidenhead from "./maidenhead";

describe("Maidenhead", () => {
    it("#valid", () => {
        expect(Maidenhead.valid("FN31")).toBe(true);
        expect(Maidenhead.valid("FN31pr")).toBe(true);
        expect(Maidenhead.valid("$%^#$%#$%")).toBe(false);
    });
});