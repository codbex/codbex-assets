import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface ValuationsEntity {
    readonly Id: number;
    Asset?: number;
    ValuationDate?: Date;
    ValuationMethod?: string;
    ValuedAt?: number;
    Remarks?: string;
}

export interface ValuationsCreateEntity {
    readonly Asset?: number;
    readonly ValuationDate?: Date;
    readonly ValuationMethod?: string;
    readonly ValuedAt?: number;
    readonly Remarks?: string;
}

export interface ValuationsUpdateEntity extends ValuationsCreateEntity {
    readonly Id: number;
}

export interface ValuationsEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Asset?: number | number[];
            ValuationDate?: Date | Date[];
            ValuationMethod?: string | string[];
            ValuedAt?: number | number[];
            Remarks?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Asset?: number | number[];
            ValuationDate?: Date | Date[];
            ValuationMethod?: string | string[];
            ValuedAt?: number | number[];
            Remarks?: string | string[];
        };
        contains?: {
            Id?: number;
            Asset?: number;
            ValuationDate?: Date;
            ValuationMethod?: string;
            ValuedAt?: number;
            Remarks?: string;
        };
        greaterThan?: {
            Id?: number;
            Asset?: number;
            ValuationDate?: Date;
            ValuationMethod?: string;
            ValuedAt?: number;
            Remarks?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Asset?: number;
            ValuationDate?: Date;
            ValuationMethod?: string;
            ValuedAt?: number;
            Remarks?: string;
        };
        lessThan?: {
            Id?: number;
            Asset?: number;
            ValuationDate?: Date;
            ValuationMethod?: string;
            ValuedAt?: number;
            Remarks?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Asset?: number;
            ValuationDate?: Date;
            ValuationMethod?: string;
            ValuedAt?: number;
            Remarks?: string;
        };
    },
    $select?: (keyof ValuationsEntity)[],
    $sort?: string | (keyof ValuationsEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ValuationsEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ValuationsEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ValuationsUpdateEntityEvent extends ValuationsEntityEvent {
    readonly previousEntity: ValuationsEntity;
}

export class ValuationsRepository {

    private static readonly DEFINITION = {
        table: "VALUATIONS",
        properties: [
            {
                name: "Id",
                column: "VALUATIONS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Asset",
                column: "VALUATIONS_ASSET",
                type: "INTEGER",
            },
            {
                name: "ValuationDate",
                column: "VALUATIONS_VALUATIONDATE",
                type: "DATE",
            },
            {
                name: "ValuationMethod",
                column: "VALUATIONS_VALUATIONMETHOD",
                type: "VARCHAR",
            },
            {
                name: "ValuedAt",
                column: "VALUATIONS_VALUEDAT",
                type: "DECIMAL",
            },
            {
                name: "Remarks",
                column: "VALUATIONS_REMARKS",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ValuationsRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ValuationsEntityOptions): ValuationsEntity[] {
        return this.dao.list(options).map((e: ValuationsEntity) => {
            EntityUtils.setDate(e, "ValuationDate");
            return e;
        });
    }

    public findById(id: number): ValuationsEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "ValuationDate");
        return entity ?? undefined;
    }

    public create(entity: ValuationsCreateEntity): number {
        EntityUtils.setLocalDate(entity, "ValuationDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "VALUATIONS",
            entity: entity,
            key: {
                name: "Id",
                column: "VALUATIONS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ValuationsUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "ValuationDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "VALUATIONS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "VALUATIONS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ValuationsCreateEntity | ValuationsUpdateEntity): number {
        const id = (entity as ValuationsUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ValuationsUpdateEntity);
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
            table: "VALUATIONS",
            entity: entity,
            key: {
                name: "Id",
                column: "VALUATIONS_ID",
                value: id
            }
        });
    }

    public count(options?: ValuationsEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "VALUATIONS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ValuationsEntityEvent | ValuationsUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-plutus-entities-Valuations", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-plutus-entities-Valuations").send(JSON.stringify(data));
    }
}
