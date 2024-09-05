import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CategoriesEntity {
    readonly Id: number;
    Name?: string;
}

export interface CategoriesCreateEntity {
    readonly Name?: string;
}

export interface CategoriesUpdateEntity extends CategoriesCreateEntity {
    readonly Id: number;
}

export interface CategoriesEntityOptions {
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
    $select?: (keyof CategoriesEntity)[],
    $sort?: string | (keyof CategoriesEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CategoriesEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CategoriesEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface CategoriesUpdateEntityEvent extends CategoriesEntityEvent {
    readonly previousEntity: CategoriesEntity;
}

export class CategoriesRepository {

    private static readonly DEFINITION = {
        table: "CATEGORIES",
        properties: [
            {
                name: "Id",
                column: "CATEGORIES_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "CATEGORIES_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CategoriesRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CategoriesEntityOptions): CategoriesEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CategoriesEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CategoriesCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CATEGORIES",
            entity: entity,
            key: {
                name: "Id",
                column: "CATEGORIES_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CategoriesUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CATEGORIES",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "CATEGORIES_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CategoriesCreateEntity | CategoriesUpdateEntity): number {
        const id = (entity as CategoriesUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CategoriesUpdateEntity);
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
            table: "CATEGORIES",
            entity: entity,
            key: {
                name: "Id",
                column: "CATEGORIES_ID",
                value: id
            }
        });
    }

    public count(options?: CategoriesEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CATEGORIES"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CategoriesEntityEvent | CategoriesUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-plutus-entities-Categories", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-plutus-entities-Categories").send(JSON.stringify(data));
    }
}
