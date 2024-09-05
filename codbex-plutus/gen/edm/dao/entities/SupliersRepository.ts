import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SupliersEntity {
    readonly Id: number;
    Name?: string;
}

export interface SupliersCreateEntity {
    readonly Name?: string;
}

export interface SupliersUpdateEntity extends SupliersCreateEntity {
    readonly Id: number;
}

export interface SupliersEntityOptions {
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
    $select?: (keyof SupliersEntity)[],
    $sort?: string | (keyof SupliersEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SupliersEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SupliersEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface SupliersUpdateEntityEvent extends SupliersEntityEvent {
    readonly previousEntity: SupliersEntity;
}

export class SupliersRepository {

    private static readonly DEFINITION = {
        table: "SUPLIERS",
        properties: [
            {
                name: "Id",
                column: "SUPLIERS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "SUPLIERS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(SupliersRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SupliersEntityOptions): SupliersEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SupliersEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SupliersCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "SUPLIERS",
            entity: entity,
            key: {
                name: "Id",
                column: "SUPLIERS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SupliersUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "SUPLIERS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "SUPLIERS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SupliersCreateEntity | SupliersUpdateEntity): number {
        const id = (entity as SupliersUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SupliersUpdateEntity);
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
            table: "SUPLIERS",
            entity: entity,
            key: {
                name: "Id",
                column: "SUPLIERS_ID",
                value: id
            }
        });
    }

    public count(options?: SupliersEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "SUPLIERS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SupliersEntityEvent | SupliersUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-plutus-entities-Supliers", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-plutus-entities-Supliers").send(JSON.stringify(data));
    }
}
