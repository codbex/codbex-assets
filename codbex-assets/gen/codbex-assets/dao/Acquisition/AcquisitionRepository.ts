import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface AcquisitionEntity {
    readonly Id: number;
    Asset?: number;
    AcquisitionDate?: Date;
    Cost?: number;
    PurchaseInvoice?: number;
}

export interface AcquisitionCreateEntity {
    readonly Asset?: number;
    readonly AcquisitionDate?: Date;
    readonly Cost?: number;
    readonly PurchaseInvoice?: number;
}

export interface AcquisitionUpdateEntity extends AcquisitionCreateEntity {
    readonly Id: number;
}

export interface AcquisitionEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Asset?: number | number[];
            AcquisitionDate?: Date | Date[];
            Cost?: number | number[];
            PurchaseInvoice?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Asset?: number | number[];
            AcquisitionDate?: Date | Date[];
            Cost?: number | number[];
            PurchaseInvoice?: number | number[];
        };
        contains?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
            PurchaseInvoice?: number;
        };
        greaterThan?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
            PurchaseInvoice?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
            PurchaseInvoice?: number;
        };
        lessThan?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
            PurchaseInvoice?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
            PurchaseInvoice?: number;
        };
    },
    $select?: (keyof AcquisitionEntity)[],
    $sort?: string | (keyof AcquisitionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AcquisitionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AcquisitionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface AcquisitionUpdateEntityEvent extends AcquisitionEntityEvent {
    readonly previousEntity: AcquisitionEntity;
}

export class AcquisitionRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ACQUISITION",
        properties: [
            {
                name: "Id",
                column: "ACQUISITION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Asset",
                column: "ACQUISITION_ASSET",
                type: "INTEGER",
            },
            {
                name: "AcquisitionDate",
                column: "ACQUISITION_ACQUISITIONDATE",
                type: "DATE",
            },
            {
                name: "Cost",
                column: "ACQUISITION_COST",
                type: "DECIMAL",
            },
            {
                name: "PurchaseInvoice",
                column: "ACQUISITION_PURCHASEINVOICE",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AcquisitionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AcquisitionEntityOptions): AcquisitionEntity[] {
        return this.dao.list(options).map((e: AcquisitionEntity) => {
            EntityUtils.setDate(e, "AcquisitionDate");
            return e;
        });
    }

    public findById(id: number): AcquisitionEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "AcquisitionDate");
        return entity ?? undefined;
    }

    public create(entity: AcquisitionCreateEntity): number {
        EntityUtils.setLocalDate(entity, "AcquisitionDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ACQUISITION",
            entity: entity,
            key: {
                name: "Id",
                column: "ACQUISITION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AcquisitionUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "AcquisitionDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ACQUISITION",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "ACQUISITION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AcquisitionCreateEntity | AcquisitionUpdateEntity): number {
        const id = (entity as AcquisitionUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AcquisitionUpdateEntity);
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
            table: "CODBEX_ACQUISITION",
            entity: entity,
            key: {
                name: "Id",
                column: "ACQUISITION_ID",
                value: id
            }
        });
    }

    public count(options?: AcquisitionEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ACQUISITION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AcquisitionEntityEvent | AcquisitionUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-Acquisition-Acquisition", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-Acquisition-Acquisition").send(JSON.stringify(data));
    }
}
