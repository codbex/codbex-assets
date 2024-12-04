import { Query, NamedQueryParameter } from "sdk/db";

export interface ASSET_VALUATION_DEPRECIATION_REPORT {
    readonly 'assetName': string;
    readonly 'assetValue': number;
    readonly 'depreciationDepreciationdate': Date;
    readonly 'depreciationAnnualdepreciation': number;
    readonly 'valuationValuationdate': Date;
    readonly 'valuationValuedat': number;
}

export interface ASSET_VALUATION_DEPRECIATION_REPORTFilter {
}

export interface ASSET_VALUATION_DEPRECIATION_REPORTPaginatedFilter extends ASSET_VALUATION_DEPRECIATION_REPORTFilter {
    readonly "$limit"?: number;
    readonly "$offset"?: number;
}

export class ASSET_VALUATION_DEPRECIATION_REPORTRepository {

    private readonly datasourceName?: string;

    constructor(datasourceName?: string) {
        this.datasourceName = datasourceName;
    }

    public findAll(filter: ASSET_VALUATION_DEPRECIATION_REPORTPaginatedFilter): ASSET_VALUATION_DEPRECIATION_REPORT[] {
        const sql = `
            SELECT CODBEX_ASSET.ASSET_NAME as "assetName", CODBEX_ASSET.ASSET_VALUE as "assetValue", CODBEX_DEPRECIATION.DEPRECIATION_DEPRECIATIONDATE as "depreciationDepreciationdate", CODBEX_DEPRECIATION.DEPRECIATION_ANNUALDEPRECIATION as "depreciationAnnualdepreciation", CODBEX_VALUATION.VALUATION_VALUATIONDATE as "valuationValuationdate", CODBEX_VALUATION.VALUATION_VALUEDAT as "valuationValuedat"
            FROM CODBEX_ASSET as CODBEX_ASSET
              INNER JOIN CODBEX_DEPRECIATION CODBEX_DEPRECIATION ON CODBEX_ASSET.ASSET_ID = CODBEX_DEPRECIATION.DEPRECIATION_ASSET
              INNER JOIN CODBEX_VALUATION CODBEX_VALUATION ON CODBEX_ASSET.ASSET_ID = CODBEX_VALUATION.VALUATION_ASSET
            ${Number.isInteger(filter.$limit) ? ` LIMIT ${filter.$limit}` : ''}
            ${Number.isInteger(filter.$offset) ? ` OFFSET ${filter.$offset}` : ''}
        `;

        const parameters: NamedQueryParameter[] = [];

        return Query.executeNamed(sql, parameters, this.datasourceName);
    }

    public count(filter: ASSET_VALUATION_DEPRECIATION_REPORTFilter): number {
        const sql = `
            SELECT COUNT(*) as REPORT_COUNT FROM (
                SELECT CODBEX_ASSET.ASSET_NAME as "assetName", CODBEX_ASSET.ASSET_VALUE as "assetValue", CODBEX_DEPRECIATION.DEPRECIATION_DEPRECIATIONDATE as "depreciationDepreciationdate", CODBEX_DEPRECIATION.DEPRECIATION_ANNUALDEPRECIATION as "depreciationAnnualdepreciation", CODBEX_VALUATION.VALUATION_VALUATIONDATE as "valuationValuationdate", CODBEX_VALUATION.VALUATION_VALUEDAT as "valuationValuedat"
                FROM CODBEX_ASSET as CODBEX_ASSET
                  INNER JOIN CODBEX_DEPRECIATION CODBEX_DEPRECIATION ON CODBEX_ASSET.ASSET_ID = CODBEX_DEPRECIATION.DEPRECIATION_ASSET
                  INNER JOIN CODBEX_VALUATION CODBEX_VALUATION ON CODBEX_ASSET.ASSET_ID = CODBEX_VALUATION.VALUATION_ASSET
            )
        `;

        const parameters: NamedQueryParameter[] = [];

        return Query.executeNamed(sql, parameters, this.datasourceName)[0].REPORT_COUNT;
    }

}