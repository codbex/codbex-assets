import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface DeprecationScheduleEntity {
    readonly Id: number;
    Name?: string;
}

export interface DeprecationScheduleCreateEntity {
    readonly Name?: string;
}

export interface DeprecationScheduleUpdateEntity extends DeprecationScheduleCreateEntity {
    readonly Id: number;
}

export interface DeprecationScheduleEntityOptions {
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
    $select?: (keyof DeprecationScheduleEntity)[],
    $sort?: string | (keyof DeprecationScheduleEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DeprecationScheduleEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DeprecationScheduleEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface DeprecationScheduleUpdateEntityEvent extends DeprecationScheduleEntityEvent {
    readonly previousEntity: DeprecationScheduleEntity;
}

export class DeprecationScheduleRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_DEPRECATIONSCHEDULE",
        properties: [
            {
                name: "Id",
                column: "DEPRECATIONSCHEDULE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "DEPRECATIONSCHEDULE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DeprecationScheduleRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DeprecationScheduleEntityOptions): DeprecationScheduleEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): DeprecationScheduleEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: DeprecationScheduleCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_DEPRECATIONSCHEDULE",
            entity: entity,
            key: {
                name: "Id",
                column: "DEPRECATIONSCHEDULE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DeprecationScheduleUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_DEPRECATIONSCHEDULE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "DEPRECATIONSCHEDULE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DeprecationScheduleCreateEntity | DeprecationScheduleUpdateEntity): number {
        const id = (entity as DeprecationScheduleUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DeprecationScheduleUpdateEntity);
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
            table: "CODBEX_DEPRECATIONSCHEDULE",
            entity: entity,
            key: {
                name: "Id",
                column: "DEPRECATIONSCHEDULE_ID",
                value: id
            }
        });
    }

    public count(options?: DeprecationScheduleEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_DEPRECATIONSCHEDULE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DeprecationScheduleEntityEvent | DeprecationScheduleUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-Settings-DeprecationSchedule", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-Settings-DeprecationSchedule").send(JSON.stringify(data));
    }
}
