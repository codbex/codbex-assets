import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ValuationMethodEntity {
    readonly Id: number;
    Name?: string;
}

export interface ValuationMethodCreateEntity {
    readonly Name?: string;
}

export interface ValuationMethodUpdateEntity extends ValuationMethodCreateEntity {
    readonly Id: number;
}

export interface ValuationMethodEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof ValuationMethodEntity)[],
    $sort?: string | (keyof ValuationMethodEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ValuationMethodEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ValuationMethodEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ValuationMethodUpdateEntityEvent extends ValuationMethodEntityEvent {
    readonly previousEntity: ValuationMethodEntity;
}

export class ValuationMethodRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_VALUATIONMETHOD",
        properties: [
            {
                name: "Id",
                column: "VALUATIONMETHOD_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "VALUATIONMETHOD_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ValuationMethodRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ValuationMethodEntityOptions): ValuationMethodEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ValuationMethodEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ValuationMethodCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_VALUATIONMETHOD",
            entity: entity,
            key: {
                name: "Id",
                column: "VALUATIONMETHOD_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ValuationMethodUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_VALUATIONMETHOD",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "VALUATIONMETHOD_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ValuationMethodCreateEntity | ValuationMethodUpdateEntity): number {
        const id = (entity as ValuationMethodUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ValuationMethodUpdateEntity);
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
            table: "CODBEX_VALUATIONMETHOD",
            entity: entity,
            key: {
                name: "Id",
                column: "VALUATIONMETHOD_ID",
                value: id
            }
        });
    }

    public count(options?: ValuationMethodEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_VALUATIONMETHOD"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ValuationMethodEntityEvent | ValuationMethodUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-ValuationMethod-ValuationMethod", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-ValuationMethod-ValuationMethod").send(JSON.stringify(data));
    }
}
