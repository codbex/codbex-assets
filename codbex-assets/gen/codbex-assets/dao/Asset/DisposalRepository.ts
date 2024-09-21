import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface DisposalEntity {
    readonly Id: number;
    Asset?: number;
    DisposalDate?: Date;
    Method?: string;
    SaleValue?: number;
    Remarks?: string;
    SalesInvoice?: number;
}

export interface DisposalCreateEntity {
    readonly Asset?: number;
    readonly DisposalDate?: Date;
    readonly Method?: string;
    readonly SaleValue?: number;
    readonly Remarks?: string;
    readonly SalesInvoice?: number;
}

export interface DisposalUpdateEntity extends DisposalCreateEntity {
    readonly Id: number;
}

export interface DisposalEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Asset?: number | number[];
            DisposalDate?: Date | Date[];
            Method?: string | string[];
            SaleValue?: number | number[];
            Remarks?: string | string[];
            SalesInvoice?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Asset?: number | number[];
            DisposalDate?: Date | Date[];
            Method?: string | string[];
            SaleValue?: number | number[];
            Remarks?: string | string[];
            SalesInvoice?: number | number[];
        };
        contains?: {
            Id?: number;
            Asset?: number;
            DisposalDate?: Date;
            Method?: string;
            SaleValue?: number;
            Remarks?: string;
            SalesInvoice?: number;
        };
        greaterThan?: {
            Id?: number;
            Asset?: number;
            DisposalDate?: Date;
            Method?: string;
            SaleValue?: number;
            Remarks?: string;
            SalesInvoice?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Asset?: number;
            DisposalDate?: Date;
            Method?: string;
            SaleValue?: number;
            Remarks?: string;
            SalesInvoice?: number;
        };
        lessThan?: {
            Id?: number;
            Asset?: number;
            DisposalDate?: Date;
            Method?: string;
            SaleValue?: number;
            Remarks?: string;
            SalesInvoice?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Asset?: number;
            DisposalDate?: Date;
            Method?: string;
            SaleValue?: number;
            Remarks?: string;
            SalesInvoice?: number;
        };
    },
    $select?: (keyof DisposalEntity)[],
    $sort?: string | (keyof DisposalEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DisposalEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DisposalEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface DisposalUpdateEntityEvent extends DisposalEntityEvent {
    readonly previousEntity: DisposalEntity;
}

export class DisposalRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_DISPOSAL",
        properties: [
            {
                name: "Id",
                column: "DISPOSAL_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Asset",
                column: "DISPOSAL_ASSET",
                type: "INTEGER",
            },
            {
                name: "DisposalDate",
                column: "DISPOSAL_DISPOSALDATE",
                type: "DATE",
            },
            {
                name: "Method",
                column: "DISPOSAL_METHOD",
                type: "VARCHAR",
            },
            {
                name: "SaleValue",
                column: "DISPOSAL_SALEVALUE",
                type: "DECIMAL",
            },
            {
                name: "Remarks",
                column: "DISPOSAL_REMARKS",
                type: "VARCHAR",
            },
            {
                name: "SalesInvoice",
                column: "DISPOSAL_SALESINVOICE",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DisposalRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DisposalEntityOptions): DisposalEntity[] {
        return this.dao.list(options).map((e: DisposalEntity) => {
            EntityUtils.setDate(e, "DisposalDate");
            return e;
        });
    }

    public findById(id: number): DisposalEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "DisposalDate");
        return entity ?? undefined;
    }

    public create(entity: DisposalCreateEntity): number {
        EntityUtils.setLocalDate(entity, "DisposalDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_DISPOSAL",
            entity: entity,
            key: {
                name: "Id",
                column: "DISPOSAL_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DisposalUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "DisposalDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_DISPOSAL",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "DISPOSAL_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DisposalCreateEntity | DisposalUpdateEntity): number {
        const id = (entity as DisposalUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DisposalUpdateEntity);
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
            table: "CODBEX_DISPOSAL",
            entity: entity,
            key: {
                name: "Id",
                column: "DISPOSAL_ID",
                value: id
            }
        });
    }

    public count(options?: DisposalEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_DISPOSAL"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DisposalEntityEvent | DisposalUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-Asset-Disposal", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-Asset-Disposal").send(JSON.stringify(data));
    }
}
