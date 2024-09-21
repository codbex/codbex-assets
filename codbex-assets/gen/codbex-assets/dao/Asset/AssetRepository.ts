import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface AssetEntity {
    readonly Id: number;
    Name?: string;
    Location?: number;
    Category?: number;
    SerialNumber?: string;
    PurchaseDate?: Date;
    Status?: string;
    Value?: number;
    Product?: number;
}

export interface AssetCreateEntity {
    readonly Name?: string;
    readonly Location?: number;
    readonly Category?: number;
    readonly SerialNumber?: string;
    readonly PurchaseDate?: Date;
    readonly Status?: string;
    readonly Value?: number;
    readonly Product?: number;
}

export interface AssetUpdateEntity extends AssetCreateEntity {
    readonly Id: number;
}

export interface AssetEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Location?: number | number[];
            Category?: number | number[];
            SerialNumber?: string | string[];
            PurchaseDate?: Date | Date[];
            Status?: string | string[];
            Value?: number | number[];
            Product?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Location?: number | number[];
            Category?: number | number[];
            SerialNumber?: string | string[];
            PurchaseDate?: Date | Date[];
            Status?: string | string[];
            Value?: number | number[];
            Product?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Location?: number;
            Category?: number;
            SerialNumber?: string;
            PurchaseDate?: Date;
            Status?: string;
            Value?: number;
            Product?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Location?: number;
            Category?: number;
            SerialNumber?: string;
            PurchaseDate?: Date;
            Status?: string;
            Value?: number;
            Product?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Location?: number;
            Category?: number;
            SerialNumber?: string;
            PurchaseDate?: Date;
            Status?: string;
            Value?: number;
            Product?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Location?: number;
            Category?: number;
            SerialNumber?: string;
            PurchaseDate?: Date;
            Status?: string;
            Value?: number;
            Product?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Location?: number;
            Category?: number;
            SerialNumber?: string;
            PurchaseDate?: Date;
            Status?: string;
            Value?: number;
            Product?: number;
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
                name: "Location",
                column: "ASSET_LOCATION",
                type: "INTEGER",
            },
            {
                name: "Category",
                column: "ASSET_CATEGORY",
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
                name: "Status",
                column: "ASSET_STATUS",
                type: "VARCHAR",
            },
            {
                name: "Value",
                column: "ASSET_VALUE",
                type: "DECIMAL",
            },
            {
                name: "Product",
                column: "ASSET_PRODUCT",
                type: "INTEGER",
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
            return e;
        });
    }

    public findById(id: number): AssetEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "PurchaseDate");
        return entity ?? undefined;
    }

    public create(entity: AssetCreateEntity): number {
        EntityUtils.setLocalDate(entity, "PurchaseDate");
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
