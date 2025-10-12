
/**
 * Defines the status of a ticket.
 * @export
 */
export const StatusType = {
    open: 'open',
    closed: 'closed'
} as const;
export type StatusType = typeof StatusType[keyof typeof StatusType];


export function instanceOfStatusType(value: any): boolean {
    for (const key in StatusType) {
        if (Object.prototype.hasOwnProperty.call(StatusType, key)) {
            if (StatusType[key as keyof typeof StatusType] === value) {
                return true;
            }
        }
    }
    return false;
}

export function StatusTypeFromJSON(json: any): StatusType {
    return StatusTypeFromJSONTyped(json, false);
}

export function StatusTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): StatusType {
    return json as StatusType;
}

export function StatusTypeToJSON(value?: StatusType | null): any {
    return value as any;
}

export function StatusTypeToJSONTyped(value: any, ignoreDiscriminator: boolean): StatusType {
    return value as StatusType;
}
