import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface DisposalMethodEntity {
    readonly Id: number;
    Name?: string;
}

export interface DisposalMethodCreateEntity {
    readonly Name?: string;
}

export interface DisposalMethodUpdateEntity extends DisposalMethodCreateEntity {
    readonly Id: number;
}

export interface DisposalMethodEntityOptions {
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
    $select?: (keyof DisposalMethodEntity)[],
    $sort?: string | (keyof DisposalMethodEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DisposalMethodEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DisposalMethodEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface DisposalMethodUpdateEntityEvent extends DisposalMethodEntityEvent {
    readonly previousEntity: DisposalMethodEntity;
}

export class DisposalMethodRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_DISPOSALMETHOD",
        properties: [
            {
                name: "Id",
                column: "DISPOSALMETHOD_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "DISPOSALMETHOD_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DisposalMethodRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DisposalMethodEntityOptions): DisposalMethodEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): DisposalMethodEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: DisposalMethodCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_DISPOSALMETHOD",
            entity: entity,
            key: {
                name: "Id",
                column: "DISPOSALMETHOD_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DisposalMethodUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_DISPOSALMETHOD",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "DISPOSALMETHOD_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DisposalMethodCreateEntity | DisposalMethodUpdateEntity): number {
        const id = (entity as DisposalMethodUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DisposalMethodUpdateEntity);
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
            table: "CODBEX_DISPOSALMETHOD",
            entity: entity,
            key: {
                name: "Id",
                column: "DISPOSALMETHOD_ID",
                value: id
            }
        });
    }

    public count(options?: DisposalMethodEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_DISPOSALMETHOD"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DisposalMethodEntityEvent | DisposalMethodUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-Settings-DisposalMethod", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-Settings-DisposalMethod").send(JSON.stringify(data));
    }
}
