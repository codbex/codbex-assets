import { AssetDeprecationService } from './AssetDeprecationService';
import { AssetRepository } from "codbex-assets/gen/codbex-assets/dao/Assets/AssetRepository";
import { DepreciationRepository } from "codbex-depreciations/gen/codbex-depreciations/dao/Depreciations/DepreciationRepository";
import { Logger, LogDataSeverity } from './Logger';

const AssetDao = new AssetRepository();
const DepreciationDao = new DepreciationRepository();

const assets = AssetDao.findAll();

assets.forEach((asset) => {
    Logger.log({
        date: new Date(),
        severity: LogDataSeverity.INFO,
        message: `Processing asset: ID=${asset.Id}, Name=${asset.Name}`
    });

    const depreciations = DepreciationDao.findAll({
        $filter: {
            equals: {
                DepreciationAsset: asset.Id
            }
        }
    });

    if (depreciations.length === 0) {
        Logger.log({
            date: new Date(),
            severity: LogDataSeverity.WARNING,
            message: `No depreciation records found for asset ID=${asset.Id}`
        });
    }

    // Calculate the accumulated depreciation value
    let accumulatedValue = 0;
    depreciations.forEach((depreciation) => {
        accumulatedValue += depreciation.AnnualDepreciation;
        Logger.log({
            date: new Date(),
            severity: LogDataSeverity.INFO,
            message: `Adding AnnualDepreciation=${depreciation.AnnualDepreciation} for asset ID=${asset.Id}`
        });
    });

    // Update the asset's accumulated value
    try {
        AssetDeprecationService.updateAccumulatedValue(asset.Id, accumulatedValue);
        Logger.log({
            date: new Date(),
            severity: LogDataSeverity.INFO,
            message: `Updated accumulated value to ${accumulatedValue} for asset ID=${asset.Id}`
        });
    } catch (error) {
        Logger.log({
            date: new Date(),
            severity: LogDataSeverity.ERROR,
            message: `Failed to update accumulated value for asset ID=${asset.Id}: ${error.message}`
        });
    }
});

Logger.log({
    date: new Date(),
    severity: LogDataSeverity.INFO,
    message: 'Processing completed.'
});
