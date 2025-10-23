import {
    StatusType,
    instanceOfStatusType,
    StatusTypeFromJSON,
    StatusTypeFromJSONTyped,
    StatusTypeToJSON,
    StatusTypeToJSONTyped,
} from "../../models/StatusType";

describe("StatusType", () => {
    // Test per l'oggetto StatusType stesso
    test("should define open and closed statuses", () => {
        expect(StatusType.open).toBe("open");
        expect(StatusType.closed).toBe("closed");
    });

    // Test per la funzione instanceOfStatusType
    describe("instanceOfStatusType", () => {
        test("should return true for valid StatusType values", () => {
            expect(instanceOfStatusType("open")).toBe(true);
            expect(instanceOfStatusType("closed")).toBe(true);
        });

        test("should return false for invalid StatusType values", () => {
            expect(instanceOfStatusType("pending")).toBe(false);
            expect(instanceOfStatusType("in_progress")).toBe(false);
            expect(instanceOfStatusType(null)).toBe(false);
            expect(instanceOfStatusType(undefined)).toBe(false);
            expect(instanceOfStatusType(123)).toBe(false);
            expect(instanceOfStatusType({})).toBe(false);
        });
    });

    // Test per StatusTypeFromJSON
    describe("StatusTypeFromJSON", () => {
        test("should correctly convert valid JSON string to StatusType", () => {
            expect(StatusTypeFromJSON("open")).toBe(StatusType.open);
            expect(StatusTypeFromJSON("closed")).toBe(StatusType.closed);
        });

        test("should return the input value for invalid JSON (Type Coercion)", () => {
            // Queste funzioni si basano su type coercion e non fanno validazione.
            // È importante capirne il comportamento: restituiscono l'input così com'è.
            expect(StatusTypeFromJSON("InvalidStatus")).toBe("InvalidStatus");
            expect(StatusTypeFromJSON(123)).toBe(123);
            expect(StatusTypeFromJSON(null)).toBeNull();
        });
    });

    // Test per StatusTypeFromJSONTyped (comportamento simile a FromJSON)
    describe("StatusTypeFromJSONTyped", () => {
        test("should correctly convert valid JSON string to StatusType", () => {
            expect(StatusTypeFromJSONTyped("open", false)).toBe(StatusType.open);
            expect(StatusTypeFromJSONTyped("closed", true)).toBe(StatusType.closed);
        });

        test("should return the input value for invalid JSON", () => {
            expect(StatusTypeFromJSONTyped("InvalidStatus", false)).toBe("InvalidStatus");
        });
    });

    // Test per StatusTypeToJSON
    describe("StatusTypeToJSON", () => {
        test("should correctly convert StatusType to JSON string", () => {
            expect(StatusTypeToJSON(StatusType.open)).toBe("open");
            expect(StatusTypeToJSON(StatusType.closed)).toBe("closed");
        });

        test("should handle null or undefined input", () => {
            expect(StatusTypeToJSON(null)).toBeNull();
            expect(StatusTypeToJSON(undefined)).toBeUndefined();
        });
    });

    // Test per StatusTypeToJSONTyped (comportamento simile a ToJSON)
    describe("StatusTypeToJSONTyped", () => {
        test("should correctly convert StatusType to JSON string", () => {
            expect(StatusTypeToJSONTyped(StatusType.open, false)).toBe("open");
            expect(StatusTypeToJSONTyped(StatusType.closed, true)).toBe("closed");
        });

        test("should handle null or undefined input", () => {
            // Anche qui, il tipo `value` come `any` permette questi casi,
            // ma in un controllo tipi stretto, questi non dovrebbero passare.
            expect(StatusTypeToJSONTyped(null, false)).toBeNull();
            expect(StatusTypeToJSONTyped(undefined, true)).toBeUndefined();
        });
    });
});