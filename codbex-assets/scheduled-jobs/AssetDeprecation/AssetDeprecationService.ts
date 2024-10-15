import { update } from "sdk/db";

export class AssetDeprecationService {
    public static updateAccumulatedValue(assetId: number, accumulatedValue: number) {
        const sql = `UPDATE "CODBEX_ASSET" SET "ASSET_ACCUMULATEDVALUE" = ? WHERE "ASSET_ID" = ?`;
        const queryParameters = [accumulatedValue, assetId];
        update.execute(sql, queryParameters);
    }
}
