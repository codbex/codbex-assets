import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface DisposalsEntity {
    readonly Id: number;
    Asset?: number;
    DisposalDate?: Date;
    Method?: string;
    SaleValue?: number;
    Remarks?: string;
}

export interface DisposalsCreateEntity {
    readonly Asset?: number;
    readonly DisposalDate?: Date;
    readonly Method?: string;
    readonly SaleValue?: number;
    readonly Remarks?: string;
}

export interface DisposalsUpdateEntity extends DisposalsCreateEntity {
    readonly Id: number;
}

export interface DisposalsEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Asset?: number | number[];
            DisposalDate?: Date | Date[];
            Method?: string | string[];
            SaleValue?: number | number[];
            Remarks?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Asset?: number | number[];
            DisposalDate?: Date | Date[];
            Method?: string | string[];
            SaleValue?: number | number[];
            Remarks?: string | string[];
        };
        contains?: {
            Id?: number;
            Asset?: number;
            DisposalDate?: Date;
            Method?: string;
            SaleValue?: number;
            Remarks?: string;
        };
        greaterThan?: {
            Id?: number;
            Asset?: number;
            DisposalDate?: Date;
            Method?: string;
            SaleValue?: number;
            Remarks?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Asset?: number;
            DisposalDate?: Date;
            Method?: string;
            SaleValue?: number;
            Remarks?: string;
        };
        lessThan?: {
            Id?: number;
            Asset?: number;
            DisposalDate?: Date;
            Method?: string;
            SaleValue?: number;
            Remarks?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Asset?: number;
            DisposalDate?: Date;
            Method?: string;
            SaleValue?: number;
            Remarks?: string;
        };
    },
    $select?: (keyof DisposalsEntity)[],
    $sort?: string | (keyof DisposalsEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DisposalsEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DisposalsEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface DisposalsUpdateEntityEvent extends DisposalsEntityEvent {
    readonly previousEntity: DisposalsEntity;
}

export class DisposalsRepository {

    private static readonly DEFINITION = {
        table: "DISPOSALS",
        properties: [
            {
                name: "Id",
                column: "DISPOSALS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Asset",
                column: "DISPOSALS_ASSET",
                type: "INTEGER",
            },
            {
                name: "DisposalDate",
                column: "DISPOSALS_DISPOSALDATE",
                type: "DATE",
            },
            {
                name: "Method",
                column: "DISPOSALS_METHOD",
                type: "VARCHAR",
            },
            {
                name: "SaleValue",
                column: "DISPOSALS_SALEVALUE",
                type: "DECIMAL",
            },
            {
                name: "Remarks",
                column: "DISPOSALS_REMARKS",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DisposalsRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DisposalsEntityOptions): DisposalsEntity[] {
        return this.dao.list(options).map((e: DisposalsEntity) => {
            EntityUtils.setDate(e, "DisposalDate");
            return e;
        });
    }

    public findById(id: number): DisposalsEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "DisposalDate");
        return entity ?? undefined;
    }

    public create(entity: DisposalsCreateEntity): number {
        EntityUtils.setLocalDate(entity, "DisposalDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "DISPOSALS",
            entity: entity,
            key: {
                name: "Id",
                column: "DISPOSALS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DisposalsUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "DisposalDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "DISPOSALS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "DISPOSALS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DisposalsCreateEntity | DisposalsUpdateEntity): number {
        const id = (entity as DisposalsUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DisposalsUpdateEntity);
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
            table: "DISPOSALS",
            entity: entity,
            key: {
                name: "Id",
                column: "DISPOSALS_ID",
                value: id
            }
        });
    }

    public count(options?: DisposalsEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "DISPOSALS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DisposalsEntityEvent | DisposalsUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-plutus-entities-Disposals", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-plutus-entities-Disposals").send(JSON.stringify(data));
    }
}
