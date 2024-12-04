import { Query, NamedQueryParameter } from "sdk/db";

export interface ASSET_MAINTENANCE_STATUS_REPORT {
    readonly 'assetName': string;
    readonly 'assetMaintenencecost': number;
    readonly 'maintenanceMaintenancedate': Date;
    readonly 'maintenanceDescription': string;
    readonly 'maintenanceCost': number;
}

export interface ASSET_MAINTENANCE_STATUS_REPORTFilter {
}

export interface ASSET_MAINTENANCE_STATUS_REPORTPaginatedFilter extends ASSET_MAINTENANCE_STATUS_REPORTFilter {
    readonly "$limit"?: number;
    readonly "$offset"?: number;
}

export class ASSET_MAINTENANCE_STATUS_REPORTRepository {

    private readonly datasourceName?: string;

    constructor(datasourceName?: string) {
        this.datasourceName = datasourceName;
    }

    public findAll(filter: ASSET_MAINTENANCE_STATUS_REPORTPaginatedFilter): ASSET_MAINTENANCE_STATUS_REPORT[] {
        const sql = `
            SELECT CODBEX_ASSET.ASSET_NAME as "assetName", CODBEX_ASSET.ASSET_MAINTENENCECOST as "assetMaintenencecost", CODBEX_MAINTENANCE.MAINTENANCE_MAINTENANCEDATE as "maintenanceMaintenancedate", CODBEX_MAINTENANCE.MAINTENANCE_DESCRIPTION as "maintenanceDescription", CODBEX_MAINTENANCE.MAINTENANCE_COST as "maintenanceCost"
            FROM CODBEX_ASSET as CODBEX_ASSET
              INNER JOIN CODBEX_MAINTENANCE CODBEX_MAINTENANCE ON CODBEX_ASSET.ASSET_ID = CODBEX_MAINTENANCE.MAINTENANCE_ASSET
            ${Number.isInteger(filter.$limit) ? ` LIMIT ${filter.$limit}` : ''}
            ${Number.isInteger(filter.$offset) ? ` OFFSET ${filter.$offset}` : ''}
        `;

        const parameters: NamedQueryParameter[] = [];

        return Query.executeNamed(sql, parameters, this.datasourceName);
    }

    public count(filter: ASSET_MAINTENANCE_STATUS_REPORTFilter): number {
        const sql = `
            SELECT COUNT(*) as REPORT_COUNT FROM (
                SELECT CODBEX_ASSET.ASSET_NAME as "assetName", CODBEX_ASSET.ASSET_MAINTENENCECOST as "assetMaintenencecost", CODBEX_MAINTENANCE.MAINTENANCE_MAINTENANCEDATE as "maintenanceMaintenancedate", CODBEX_MAINTENANCE.MAINTENANCE_DESCRIPTION as "maintenanceDescription", CODBEX_MAINTENANCE.MAINTENANCE_COST as "maintenanceCost"
                FROM CODBEX_ASSET as CODBEX_ASSET
                  INNER JOIN CODBEX_MAINTENANCE CODBEX_MAINTENANCE ON CODBEX_ASSET.ASSET_ID = CODBEX_MAINTENANCE.MAINTENANCE_ASSET
            )
        `;

        const parameters: NamedQueryParameter[] = [];

        return Query.executeNamed(sql, parameters, this.datasourceName)[0].REPORT_COUNT;
    }

}