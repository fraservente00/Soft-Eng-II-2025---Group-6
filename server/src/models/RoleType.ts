
/**
 * Defines the role of a user.
 * @export
 */
export const RoleType = {
    Customer: 'Customer',
    Officer: 'Officer'
} as const;
export type RoleType = typeof RoleType[keyof typeof RoleType];


export function instanceOfRoleType(value: any): boolean {
    for (const key in RoleType) {
        if (Object.prototype.hasOwnProperty.call(RoleType, key)) {
            if (RoleType[key as keyof typeof RoleType] === value) {
                return true;
            }
        }
    }
    return false;
}

export function RoleTypeFromJSON(json: any): RoleType {
    return RoleTypeFromJSONTyped(json, false);
}

export function RoleTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): RoleType {
    return json as RoleType;
}

export function RoleTypeToJSON(value?: RoleType | null): any {
    return value as any;
}

export function RoleTypeToJSONTyped(value: any, ignoreDiscriminator: boolean): RoleType {
    return value as RoleType;
}
