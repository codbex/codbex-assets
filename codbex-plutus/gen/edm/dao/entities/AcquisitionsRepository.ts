import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface AcquisitionsEntity {
    readonly Id: number;
    Asset?: number;
    AcquisitionDate?: Date;
    Suplier?: number;
    Cost?: number;
    PaymentMethod?: string;
}

export interface AcquisitionsCreateEntity {
    readonly Asset?: number;
    readonly AcquisitionDate?: Date;
    readonly Suplier?: number;
    readonly Cost?: number;
    readonly PaymentMethod?: string;
}

export interface AcquisitionsUpdateEntity extends AcquisitionsCreateEntity {
    readonly Id: number;
}

export interface AcquisitionsEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Asset?: number | number[];
            AcquisitionDate?: Date | Date[];
            Suplier?: number | number[];
            Cost?: number | number[];
            PaymentMethod?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Asset?: number | number[];
            AcquisitionDate?: Date | Date[];
            Suplier?: number | number[];
            Cost?: number | number[];
            PaymentMethod?: string | string[];
        };
        contains?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Suplier?: number;
            Cost?: number;
            PaymentMethod?: string;
        };
        greaterThan?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Suplier?: number;
            Cost?: number;
            PaymentMethod?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Suplier?: number;
            Cost?: number;
            PaymentMethod?: string;
        };
        lessThan?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Suplier?: number;
            Cost?: number;
            PaymentMethod?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Suplier?: number;
            Cost?: number;
            PaymentMethod?: string;
        };
    },
    $select?: (keyof AcquisitionsEntity)[],
    $sort?: string | (keyof AcquisitionsEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AcquisitionsEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AcquisitionsEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface AcquisitionsUpdateEntityEvent extends AcquisitionsEntityEvent {
    readonly previousEntity: AcquisitionsEntity;
}

export class AcquisitionsRepository {

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
                name: "Suplier",
                column: "ACQUISITIONS_SUPLIER",
                type: "INTEGER",
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
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AcquisitionsRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AcquisitionsEntityOptions): AcquisitionsEntity[] {
        return this.dao.list(options).map((e: AcquisitionsEntity) => {
            EntityUtils.setDate(e, "AcquisitionDate");
            return e;
        });
    }

    public findById(id: number): AcquisitionsEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "AcquisitionDate");
        return entity ?? undefined;
    }

    public create(entity: AcquisitionsCreateEntity): number {
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

    public update(entity: AcquisitionsUpdateEntity): void {
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

    public upsert(entity: AcquisitionsCreateEntity | AcquisitionsUpdateEntity): number {
        const id = (entity as AcquisitionsUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AcquisitionsUpdateEntity);
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

    public count(options?: AcquisitionsEntityOptions): number {
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

    private async triggerEvent(data: AcquisitionsEntityEvent | AcquisitionsUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-plutus-entities-Acquisitions", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-plutus-entities-Acquisitions").send(JSON.stringify(data));
    }
}
