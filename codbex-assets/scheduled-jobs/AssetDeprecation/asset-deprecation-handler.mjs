import { AssetDeprecationService } from './AssetDeprecationService';
import { AssetRepository } from "codbex-assets/gen/codbex-assets/dao/Asset/AssetRepository";
import { DepreciationRepository } from "codbex-assets/gen/codbex-assets/dao/Asset/DepreciationRepository";

const AssetDao = new AssetRepository();
const DepreciationDao = new DepreciationRepository();

const assets = AssetDao.findAll();

assets.forEach((asset) => {
    console.log(`Processing asset: ID=${asset.Id}, Name=${asset.Name}`);

    const depreciations = DepreciationDao.findAll({
        $filter: {
            equals: {
                DepreciationAsset: asset.Id
            }
        }
    });

    if (depreciations.length === 0) {
        console.log(`No depreciation records found for asset ID=${asset.Id}`);
    }

    // Calculate the accumulated depreciation value
    let accumulatedValue = 0;
    depreciations.forEach((depreciation) => {
        accumulatedValue += depreciation.AnnualDepreciation;
        console.log(`Adding AnnualDepreciation=${depreciation.AnnualDepreciation} for asset ID=${asset.Id}`);
    });

    // Update the asset's accumulated value
    AssetDeprecationService.updateAccumulatedValue(asset.Id, accumulatedValue);
    console.log(`Updated accumulated value to ${accumulatedValue} for asset ID=${asset.Id}`);
});

console.log('Processing completed.');