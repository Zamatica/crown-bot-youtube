/**
 * @author     Noah Sweet
 * @file       permissions.ts
 */

import { Events } from "@lib/events/events";
import { Any } from "@util/object";

export type PermissionEventCallbackFunctionType<UserType> = (user: UserType) => Any;

export class Permissions {
    static register_events<UserType>(events: Events, permissionCallbackFunction: PermissionEventCallbackFunctionType<UserType>): void {
        events.on('permissions::check-user', permissionCallbackFunction);
    }
}

