import { AssetDeprecationService } from './AssetDeprecationService';
import { AssetRepository } from "codbex-assets/gen/codbex-assets/dao/Asset/AssetRepository";
import { DepreciationRepository } from "codbex-assets/gen/codbex-assets/dao/Asset/DepreciationRepository";

const AssetDao = new AssetRepository();
const DepreciationDao = new DepreciationRepository();

const assets = AssetDao.findAll();

assets.forEach((asset) => {
    console.log(`Processing asset: ID=${asset.Id}, Name=${asset.Name}`);

    let currentAccumulatedValue = asset.AccumulatedValue || 0;
    console.log(`Current accumulated value for asset ID=${asset.Id} is ${currentAccumulatedValue}`);

    const depreciations = DepreciationDao.findAll({
        $filter: {
            equals: {
                Asset: asset.Id
            }
        }
    });

    depreciations.forEach((depreciation) => {
        console.log(depreciation.Asset);
    })

    if (depreciations.length === 0) {
        console.log(`No depreciation records found for asset ID=${asset.Id}`);
    }

    let totalDepreciation = 0;
    depreciations.forEach((depreciation) => {
        totalDepreciation += depreciation.AnnualDepreciation;
        console.log(`Subtracting AnnualDepreciation=${depreciation.AnnualDepreciation} for asset ID=${asset.Id}`);
    });

    let newAccumulatedValue = currentAccumulatedValue - totalDepreciation;

    if (newAccumulatedValue < 0) {
        newAccumulatedValue = 0;
        console.log(`Accumulated value for asset ID=${asset.Id} is below zero, setting it to zero.`);
    }

    AssetDeprecationService.updateAccumulatedValue(asset.Id, newAccumulatedValue);
    console.log(`Updated accumulated value to ${newAccumulatedValue} for asset ID=${asset.Id}`);
});

console.log('Processing completed.');
