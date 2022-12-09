import { SapphireClient } from "@sapphire/framework";
import type { ClientOptions } from "discord.js";
import { DatabaseClient } from "#lib/DatabaseClient";
export declare class PrismClient extends SapphireClient {
    constructor(options: ClientOptions);
}
export interface PrismClient {
    db: DatabaseClient;
}
//# sourceMappingURL=Client.d.ts.map