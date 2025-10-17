import {
    RoleType,
    instanceOfRoleType,
    RoleTypeFromJSON,
    RoleTypeFromJSONTyped,
    RoleTypeToJSON,
    RoleTypeToJSONTyped,
} from "../../models/RoleType";

describe("RoleType", () => {
    // Test per l'oggetto RoleType stesso
    test("should define Customer and Officer roles", () => {
        expect(RoleType.Customer).toBe("Customer");
        expect(RoleType.Officer).toBe("Officer");
    });

    // Test per la funzione instanceOfRoleType
    describe("instanceOfRoleType", () => {
        test("should return true for valid RoleType values", () => {
            expect(instanceOfRoleType("Customer")).toBe(true);
            expect(instanceOfRoleType("Officer")).toBe(true);
        });

        test("should return false for invalid RoleType values", () => {
            expect(instanceOfRoleType("Admin")).toBe(false);
            expect(instanceOfRoleType("Manager")).toBe(false);
            expect(instanceOfRoleType(null)).toBe(false);
            expect(instanceOfRoleType(undefined)).toBe(false);
            expect(instanceOfRoleType(123)).toBe(false);
            expect(instanceOfRoleType({})).toBe(false);
        });
    });

    // Test per RoleTypeFromJSON
    describe("RoleTypeFromJSON", () => {
        test("should correctly convert valid JSON string to RoleType", () => {
            expect(RoleTypeFromJSON("Customer")).toBe(RoleType.Customer);
            expect(RoleTypeFromJSON("Officer")).toBe(RoleType.Officer);
        });

        test("should return the input value for invalid JSON (Type Coercion)", () => {
            // Queste funzioni si basano su type coercion e non fanno validazione.
            // È importante capirne il comportamento: restituiscono l'input così com'è.
            expect(RoleTypeFromJSON("InvalidRole")).toBe("InvalidRole");
            expect(RoleTypeFromJSON(123)).toBe(123);
            expect(RoleTypeFromJSON(null)).toBeNull();
        });
    });

    // Test per RoleTypeFromJSONTyped (comportamento simile a FromJSON)
    describe("RoleTypeFromJSONTyped", () => {
        test("should correctly convert valid JSON string to RoleType", () => {
            expect(RoleTypeFromJSONTyped("Customer", false)).toBe(RoleType.Customer);
            expect(RoleTypeFromJSONTyped("Officer", true)).toBe(RoleType.Officer);
        });

        test("should return the input value for invalid JSON", () => {
            expect(RoleTypeFromJSONTyped("InvalidRole", false)).toBe("InvalidRole");
        });
    });

    // Test per RoleTypeToJSON
    describe("RoleTypeToJSON", () => {
        test("should correctly convert RoleType to JSON string", () => {
            expect(RoleTypeToJSON(RoleType.Customer)).toBe("Customer");
            expect(RoleTypeToJSON(RoleType.Officer)).toBe("Officer");
        });

        test("should handle null or undefined input", () => {
            expect(RoleTypeToJSON(null)).toBeNull();
            expect(RoleTypeToJSON(undefined)).toBeUndefined();
        });
    });

    // Test per RoleTypeToJSONTyped (comportamento simile a ToJSON)
    describe("RoleTypeToJSONTyped", () => {
        test("should correctly convert RoleType to JSON string", () => {
            expect(RoleTypeToJSONTyped(RoleType.Customer, false)).toBe("Customer");
            expect(RoleTypeToJSONTyped(RoleType.Officer, true)).toBe("Officer");
        });

        test("should handle null or undefined input (though input type expects RoleType)", () => {
            // In un'implementazione reale, il tipo `value` non dovrebbe essere `any` se si vuole il controllo forte
            // ma dato il codice fornito, si testa il comportamento attuale.
            expect(RoleTypeToJSONTyped(null, false)).toBeNull();
            expect(RoleTypeToJSONTyped(undefined, true)).toBeUndefined();
        });
    });
});