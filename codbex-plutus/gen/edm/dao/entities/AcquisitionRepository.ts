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
    PaymentMethod?: string;
    Supplier?: number;
}

export interface AcquisitionCreateEntity {
    readonly Asset?: number;
    readonly AcquisitionDate?: Date;
    readonly Cost?: number;
    readonly PaymentMethod?: string;
    readonly Supplier?: number;
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
            PaymentMethod?: string | string[];
            Supplier?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Asset?: number | number[];
            AcquisitionDate?: Date | Date[];
            Cost?: number | number[];
            PaymentMethod?: string | string[];
            Supplier?: number | number[];
        };
        contains?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
            PaymentMethod?: string;
            Supplier?: number;
        };
        greaterThan?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
            PaymentMethod?: string;
            Supplier?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
            PaymentMethod?: string;
            Supplier?: number;
        };
        lessThan?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
            PaymentMethod?: string;
            Supplier?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
            PaymentMethod?: string;
            Supplier?: number;
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
        table: "ACQUISITIONS",
        properties: [
            {
                name: "Id",
                column: "ACQUISITIONS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Asset",
                column: "ACQUISITIONS_ASSET",
                type: "INTEGER",
            },
            {
                name: "AcquisitionDate",
                column: "ACQUISITIONS_ACQUISITIONDATE",
                type: "DATE",
            },
            {
                name: "Cost",
                column: "ACQUISITIONS_COST",
                type: "DECIMAL",
            },
            {
                name: "PaymentMethod",
                column: "ACQUISITIONS_PAYMENTMETHOD",
                type: "VARCHAR",
            },
            {
                name: "Supplier",
                column: "ACQUISITIONS_SUPPLIER",
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
            table: "ACQUISITIONS",
            entity: entity,
            key: {
                name: "Id",
                column: "ACQUISITIONS_ID",
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
            table: "ACQUISITIONS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "ACQUISITIONS_ID",
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
            table: "ACQUISITIONS",
            entity: entity,
            key: {
                name: "Id",
                column: "ACQUISITIONS_ID",
                value: id
            }
        });
    }

    public count(options?: AcquisitionEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "ACQUISITIONS"');
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
        const triggerExtensions = await extensions.loadExtensionModules("codbex-plutus-entities-Acquisition", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-plutus-entities-Acquisition").send(JSON.stringify(data));
    }
}
