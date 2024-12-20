import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface ValuationEntity {
    readonly Id: number;
    Asset?: number;
    ValuationDate?: Date;
    ValuedAt?: number;
    ValuationMethod?: number;
    Remarks?: string;
    Supplier?: number;
}

export interface ValuationCreateEntity {
    readonly Asset?: number;
    readonly ValuationDate?: Date;
    readonly ValuedAt?: number;
    readonly ValuationMethod?: number;
    readonly Remarks?: string;
    readonly Supplier?: number;
}

export interface ValuationUpdateEntity extends ValuationCreateEntity {
    readonly Id: number;
}

export interface ValuationEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Asset?: number | number[];
            ValuationDate?: Date | Date[];
            ValuedAt?: number | number[];
            ValuationMethod?: number | number[];
            Remarks?: string | string[];
            Supplier?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Asset?: number | number[];
            ValuationDate?: Date | Date[];
            ValuedAt?: number | number[];
            ValuationMethod?: number | number[];
            Remarks?: string | string[];
            Supplier?: number | number[];
        };
        contains?: {
            Id?: number;
            Asset?: number;
            ValuationDate?: Date;
            ValuedAt?: number;
            ValuationMethod?: number;
            Remarks?: string;
            Supplier?: number;
        };
        greaterThan?: {
            Id?: number;
            Asset?: number;
            ValuationDate?: Date;
            ValuedAt?: number;
            ValuationMethod?: number;
            Remarks?: string;
            Supplier?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Asset?: number;
            ValuationDate?: Date;
            ValuedAt?: number;
            ValuationMethod?: number;
            Remarks?: string;
            Supplier?: number;
        };
        lessThan?: {
            Id?: number;
            Asset?: number;
            ValuationDate?: Date;
            ValuedAt?: number;
            ValuationMethod?: number;
            Remarks?: string;
            Supplier?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Asset?: number;
            ValuationDate?: Date;
            ValuedAt?: number;
            ValuationMethod?: number;
            Remarks?: string;
            Supplier?: number;
        };
    },
    $select?: (keyof ValuationEntity)[],
    $sort?: string | (keyof ValuationEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ValuationEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ValuationEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ValuationUpdateEntityEvent extends ValuationEntityEvent {
    readonly previousEntity: ValuationEntity;
}

export class ValuationRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_VALUATION",
        properties: [
            {
                name: "Id",
                column: "VALUATION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Asset",
                column: "VALUATION_ASSET",
                type: "INTEGER",
            },
            {
                name: "ValuationDate",
                column: "VALUATION_VALUATIONDATE",
                type: "DATE",
            },
            {
                name: "ValuedAt",
                column: "VALUATION_VALUEDAT",
                type: "DECIMAL",
            },
            {
                name: "ValuationMethod",
                column: "VALUATION_VALUATIONMETHOD",
                type: "INTEGER",
            },
            {
                name: "Remarks",
                column: "VALUATION_REMARKS",
                type: "VARCHAR",
            },
            {
                name: "Supplier",
                column: "VALUATION_SUPPLIER",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ValuationRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ValuationEntityOptions): ValuationEntity[] {
        return this.dao.list(options).map((e: ValuationEntity) => {
            EntityUtils.setDate(e, "ValuationDate");
            return e;
        });
    }

    public findById(id: number): ValuationEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "ValuationDate");
        return entity ?? undefined;
    }

    public create(entity: ValuationCreateEntity): number {
        EntityUtils.setLocalDate(entity, "ValuationDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_VALUATION",
            entity: entity,
            key: {
                name: "Id",
                column: "VALUATION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ValuationUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "ValuationDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_VALUATION",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "VALUATION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ValuationCreateEntity | ValuationUpdateEntity): number {
        const id = (entity as ValuationUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ValuationUpdateEntity);
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
            table: "CODBEX_VALUATION",
            entity: entity,
            key: {
                name: "Id",
                column: "VALUATION_ID",
                value: id
            }
        });
    }

    public count(options?: ValuationEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_VALUATION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ValuationEntityEvent | ValuationUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-Asset-Valuation", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-Asset-Valuation").send(JSON.stringify(data));
    }
}
