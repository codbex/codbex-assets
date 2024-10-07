import { AssetRepository } from "../../gen/codbex-assets/dao/Asset/AssetRepository";
import { MaintenanceRepository } from "../../gen/codbex-assets/dao/Asset/MaintenanceRepository";

export const trigger = (event: any) => {
    const assetRepo = new AssetRepository();
    const maintenanceRepo = new MaintenanceRepository();
    const maintenance = event.entity;

    const asset = assetRepo.findById(maintenance.Asset);
    if (!asset) return;

    const maintenances = maintenanceRepo.findAll({
        $filter: {
            equals: {
                Asset: maintenance.Asset
            }
        }
    });

    let totalMaintenanceCost = 0;

    for (let i = 0; i < maintenances.length; i++) {
        if (maintenances[i].Cost) {
            totalMaintenanceCost += maintenances[i].Cost || 0;
        }
    }

    asset.MaintenenceCost = totalMaintenanceCost;
    assetRepo.update(asset);
};
