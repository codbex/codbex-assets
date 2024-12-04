import { Query, NamedQueryParameter } from "sdk/db";

export interface AssetAcquisitionDisposal {
    readonly 'assetName': string;
    readonly 'assetValue': number;
    readonly 'acquisitionDate': Date;
    readonly 'acquisitionCost': number;
    readonly 'disposalDate': Date;
    readonly 'disposalMethod': string;
}

export interface AssetAcquisitionDisposalFilter {
}

export interface AssetAcquisitionDisposalPaginatedFilter extends AssetAcquisitionDisposalFilter {
    readonly "$limit"?: number;
    readonly "$offset"?: number;
}

export class AssetAcquisitionDisposalRepository {

    private readonly datasourceName?: string;

    constructor(datasourceName?: string) {
        this.datasourceName = datasourceName;
    }

    public findAll(filter: AssetAcquisitionDisposalPaginatedFilter): AssetAcquisitionDisposal[] {
        const sql = `
            SELECT CODBEX_ASSET.ASSET_NAME as "assetName", CODBEX_ASSET.ASSET_VALUE as "assetValue", CODBEX_ACQUISITION.ACQUISITION_DATE as "acquisitionDate", CODBEX_ACQUISITION.ACQUISITION_COST as "acquisitionCost", CODBEX_DISPOSAL.DISPOSAL_DATE as "disposalDate", CODBEX_DISPOSAL.DISPOSAL_METHOD as "disposalMethod"
            FROM CODBEX_ASSET as CODBEX_ASSET
              INNER JOIN CODBEX_ACQUISITION CODBEX_ACQUISITION ON CODBEX_ASSET.ASSET_ID = CODBEX_ACQUISITION.ACQUISITION_ASSET
              INNER JOIN CODBEX_DISPOSAL CODBEX_DISPOSAL ON CODBEX_ASSET.ASSET_ID = CODBEX_DISPOSAL.DISPOSAL_ASSET
            ${Number.isInteger(filter.$limit) ? ` LIMIT ${filter.$limit}` : ''}
            ${Number.isInteger(filter.$offset) ? ` OFFSET ${filter.$offset}` : ''}
        `;

        const parameters: NamedQueryParameter[] = [];

        return Query.executeNamed(sql, parameters, this.datasourceName);
    }

    public count(filter: AssetAcquisitionDisposalFilter): number {
        const sql = `
            SELECT COUNT(*) as REPORT_COUNT FROM (
                SELECT CODBEX_ASSET.ASSET_NAME as "assetName", CODBEX_ASSET.ASSET_VALUE as "assetValue", CODBEX_ACQUISITION.ACQUISITION_DATE as "acquisitionDate", CODBEX_ACQUISITION.ACQUISITION_COST as "acquisitionCost", CODBEX_DISPOSAL.DISPOSAL_DATE as "disposalDate", CODBEX_DISPOSAL.DISPOSAL_METHOD as "disposalMethod"
                FROM CODBEX_ASSET as CODBEX_ASSET
                  INNER JOIN CODBEX_ACQUISITION CODBEX_ACQUISITION ON CODBEX_ASSET.ASSET_ID = CODBEX_ACQUISITION.ACQUISITION_ASSET
                  INNER JOIN CODBEX_DISPOSAL CODBEX_DISPOSAL ON CODBEX_ASSET.ASSET_ID = CODBEX_DISPOSAL.DISPOSAL_ASSET
            )
        `;

        const parameters: NamedQueryParameter[] = [];

        return Query.executeNamed(sql, parameters, this.datasourceName)[0].REPORT_COUNT;
    }

}