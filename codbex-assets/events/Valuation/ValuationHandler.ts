import { AssetRepository } from "../../gen/codbex-assets/dao/Asset/AssetRepository";

export const trigger = (event) => {
    const assetRepo = new AssetRepository();
    const valuation = event.entity;

    const asset = assetRepo.findById(valuation.Asset);
    console.log(asset);
    console.log(valuation);
    if (!asset) return;

    asset.AccumulatedValue = valuation.ValuedAt;
    assetRepo.update(asset);
};
