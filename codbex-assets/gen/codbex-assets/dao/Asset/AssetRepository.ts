import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface AssetEntity {
    readonly Id: number;
    Name?: string;
    Company?: number;
    SerialNumber?: string;
    PurchaseDate?: Date;
    AquiredValue?: number;
    AccumulatedValue?: number;
    UsefulLife?: Date;
    ResidualValue?: number;
    Product?: number;
    Store?: number;
    PurchaseInvoice?: number;
    TotalOperationCost?: number;
}

export interface AssetCreateEntity {
    readonly Name?: string;
    readonly Company?: number;
    readonly SerialNumber?: string;
    readonly PurchaseDate?: Date;
    readonly AquiredValue?: number;
    readonly AccumulatedValue?: number;
    readonly UsefulLife?: Date;
    readonly ResidualValue?: number;
    readonly Product?: number;
    readonly Store?: number;
    readonly PurchaseInvoice?: number;
    readonly TotalOperationCost?: number;
}

export interface AssetUpdateEntity extends AssetCreateEntity {
    readonly Id: number;
}

export interface AssetEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Company?: number | number[];
            SerialNumber?: string | string[];
            PurchaseDate?: Date | Date[];
            AquiredValue?: number | number[];
            AccumulatedValue?: number | number[];
            UsefulLife?: Date | Date[];
            ResidualValue?: number | number[];
            Product?: number | number[];
            Store?: number | number[];
            PurchaseInvoice?: number | number[];
            TotalOperationCost?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Company?: number | number[];
            SerialNumber?: string | string[];
            PurchaseDate?: Date | Date[];
            AquiredValue?: number | number[];
            AccumulatedValue?: number | number[];
            UsefulLife?: Date | Date[];
            ResidualValue?: number | number[];
            Product?: number | number[];
            Store?: number | number[];
            PurchaseInvoice?: number | number[];
            TotalOperationCost?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Company?: number;
            SerialNumber?: string;
            PurchaseDate?: Date;
            AquiredValue?: number;
            AccumulatedValue?: number;
            UsefulLife?: Date;
            ResidualValue?: number;
            Product?: number;
            Store?: number;
            PurchaseInvoice?: number;
            TotalOperationCost?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Company?: number;
            SerialNumber?: string;
            PurchaseDate?: Date;
            AquiredValue?: number;
            AccumulatedValue?: number;
            UsefulLife?: Date;
            ResidualValue?: number;
            Product?: number;
            Store?: number;
            PurchaseInvoice?: number;
            TotalOperationCost?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Company?: number;
            SerialNumber?: string;
            PurchaseDate?: Date;
            AquiredValue?: number;
            AccumulatedValue?: number;
            UsefulLife?: Date;
            ResidualValue?: number;
            Product?: number;
            Store?: number;
            PurchaseInvoice?: number;
            TotalOperationCost?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Company?: number;
            SerialNumber?: string;
            PurchaseDate?: Date;
            AquiredValue?: number;
            AccumulatedValue?: number;
            UsefulLife?: Date;
            ResidualValue?: number;
            Product?: number;
            Store?: number;
            PurchaseInvoice?: number;
            TotalOperationCost?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Company?: number;
            SerialNumber?: string;
            PurchaseDate?: Date;
            AquiredValue?: number;
            AccumulatedValue?: number;
            UsefulLife?: Date;
            ResidualValue?: number;
            Product?: number;
            Store?: number;
            PurchaseInvoice?: number;
            TotalOperationCost?: number;
        };
    },
    $select?: (keyof AssetEntity)[],
    $sort?: string | (keyof AssetEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AssetEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AssetEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface AssetUpdateEntityEvent extends AssetEntityEvent {
    readonly previousEntity: AssetEntity;
}

export class AssetRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ASSET",
        properties: [
            {
                name: "Id",
                column: "ASSET_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "ASSET_NAME",
                type: "VARCHAR",
            },
            {
                name: "Company",
                column: "ASSET_COMPANY",
                type: "INTEGER",
            },
            {
                name: "SerialNumber",
                column: "ASSET_SERIALNUMBER",
                type: "VARCHAR",
            },
            {
                name: "PurchaseDate",
                column: "ASSET_PURCHASEDATE",
                type: "DATE",
            },
            {
                name: "AquiredValue",
                column: "ASSET_VALUE",
                type: "DECIMAL",
            },
            {
                name: "AccumulatedValue",
                column: "ASSET_ACCUMULATEDVALUE",
                type: "DECIMAL",
            },
            {
                name: "UsefulLife",
                column: "ASSET_USEFULLIFE",
                type: "DATE",
            },
            {
                name: "ResidualValue",
                column: "ASSET_RESIDUALVALUE",
                type: "DECIMAL",
            },
            {
                name: "Product",
                column: "ASSET_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "Store",
                column: "ASSET_STORE",
                type: "INTEGER",
            },
            {
                name: "PurchaseInvoice",
                column: "ASSET_PURCHASEINVOICE",
                type: "INTEGER",
            },
            {
                name: "TotalOperationCost",
                column: "ASSET_TOTALOPERATIONCOST",
                type: "DECIMAL",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AssetRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AssetEntityOptions): AssetEntity[] {
        return this.dao.list(options).map((e: AssetEntity) => {
            EntityUtils.setDate(e, "PurchaseDate");
            EntityUtils.setDate(e, "UsefulLife");
            return e;
        });
    }

    public findById(id: number): AssetEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "PurchaseDate");
        EntityUtils.setDate(entity, "UsefulLife");
        return entity ?? undefined;
    }

    public create(entity: AssetCreateEntity): number {
        EntityUtils.setLocalDate(entity, "PurchaseDate");
        EntityUtils.setLocalDate(entity, "UsefulLife");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ASSET",
            entity: entity,
            key: {
                name: "Id",
                column: "ASSET_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AssetUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "PurchaseDate");
        // EntityUtils.setLocalDate(entity, "UsefulLife");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ASSET",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "ASSET_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AssetCreateEntity | AssetUpdateEntity): number {
        const id = (entity as AssetUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AssetUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_ASSET",
            entity: entity,
            key: {
                name: "Id",
                column: "ASSET_ID",
                value: id
            }
        });
    }

    public count(options?: AssetEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ASSET"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AssetEntityEvent | AssetUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-Asset-Asset", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-Asset-Asset").send(JSON.stringify(data));
    }
}
