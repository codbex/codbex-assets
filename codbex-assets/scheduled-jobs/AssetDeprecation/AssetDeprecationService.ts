import { update } from "sdk/db";

export class AssetDeprecationService {
    public static updateAccumulatedValue(assetId: number, accumulatedValue: number) {
        const sql = `UPDATE "ASSET" SET "ASSET_ACCUMULATEDVALUE" = ? WHERE "ASSET_ID" = ?`;
        const queryParameters = [accumulatedValue, assetId];
        update.execute(sql, queryParameters);
    }
}
