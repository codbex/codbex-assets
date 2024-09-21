import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CategoryEntity {
    readonly Id: number;
    Name?: string;
}

export interface CategoryCreateEntity {
    readonly Name?: string;
}

export interface CategoryUpdateEntity extends CategoryCreateEntity {
    readonly Id: number;
}

export interface CategoryEntityOptions {
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
    $select?: (keyof CategoryEntity)[],
    $sort?: string | (keyof CategoryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CategoryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CategoryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface CategoryUpdateEntityEvent extends CategoryEntityEvent {
    readonly previousEntity: CategoryEntity;
}

export class CategoryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CATEGORY",
        properties: [
            {
                name: "Id",
                column: "CATEGORY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "CATEGORY_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CategoryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CategoryEntityOptions): CategoryEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CategoryEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CategoryCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "CATEGORY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CategoryUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CATEGORY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "CATEGORY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CategoryCreateEntity | CategoryUpdateEntity): number {
        const id = (entity as CategoryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CategoryUpdateEntity);
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
            table: "CODBEX_CATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "CATEGORY_ID",
                value: id
            }
        });
    }

    public count(options?: CategoryEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CATEGORY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CategoryEntityEvent | CategoryUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-Category-Category", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-Category-Category").send(JSON.stringify(data));
    }
}
