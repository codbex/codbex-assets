import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface DepreciationsEntity {
    readonly Id: number;
    Asset?: number;
    DepreciationDate?: Date;
    Method?: string;
    AnnualDepreciation?: number;
    AccumulatedDepreciation?: number;
}

export interface DepreciationsCreateEntity {
    readonly Asset?: number;
    readonly DepreciationDate?: Date;
    readonly Method?: string;
    readonly AnnualDepreciation?: number;
    readonly AccumulatedDepreciation?: number;
}

export interface DepreciationsUpdateEntity extends DepreciationsCreateEntity {
    readonly Id: number;
}

export interface DepreciationsEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Asset?: number | number[];
            DepreciationDate?: Date | Date[];
            Method?: string | string[];
            AnnualDepreciation?: number | number[];
            AccumulatedDepreciation?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Asset?: number | number[];
            DepreciationDate?: Date | Date[];
            Method?: string | string[];
            AnnualDepreciation?: number | number[];
            AccumulatedDepreciation?: number | number[];
        };
        contains?: {
            Id?: number;
            Asset?: number;
            DepreciationDate?: Date;
            Method?: string;
            AnnualDepreciation?: number;
            AccumulatedDepreciation?: number;
        };
        greaterThan?: {
            Id?: number;
            Asset?: number;
            DepreciationDate?: Date;
            Method?: string;
            AnnualDepreciation?: number;
            AccumulatedDepreciation?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Asset?: number;
            DepreciationDate?: Date;
            Method?: string;
            AnnualDepreciation?: number;
            AccumulatedDepreciation?: number;
        };
        lessThan?: {
            Id?: number;
            Asset?: number;
            DepreciationDate?: Date;
            Method?: string;
            AnnualDepreciation?: number;
            AccumulatedDepreciation?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Asset?: number;
            DepreciationDate?: Date;
            Method?: string;
            AnnualDepreciation?: number;
            AccumulatedDepreciation?: number;
        };
    },
    $select?: (keyof DepreciationsEntity)[],
    $sort?: string | (keyof DepreciationsEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DepreciationsEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DepreciationsEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface DepreciationsUpdateEntityEvent extends DepreciationsEntityEvent {
    readonly previousEntity: DepreciationsEntity;
}

export class DepreciationsRepository {

    private static readonly DEFINITION = {
        table: "DEPRECIATIONS",
        properties: [
            {
                name: "Id",
                column: "DEPRECIATIONS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Asset",
                column: "DEPRECIATIONS_ASSET",
                type: "INTEGER",
            },
            {
                name: "DepreciationDate",
                column: "DEPRECIATIONS_DEPRECIATIONDATE",
                type: "DATE",
            },
            {
                name: "Method",
                column: "DEPRECIATIONS_METHOD",
                type: "VARCHAR",
            },
            {
                name: "AnnualDepreciation",
                column: "DEPRECIATIONS_ANNUALDEPRECIATION",
                type: "DECIMAL",
            },
            {
                name: "AccumulatedDepreciation",
                column: "DEPRECIATIONS_ACCUMULATEDDEPRECIATION",
                type: "DECIMAL",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DepreciationsRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DepreciationsEntityOptions): DepreciationsEntity[] {
        return this.dao.list(options).map((e: DepreciationsEntity) => {
            EntityUtils.setDate(e, "DepreciationDate");
            return e;
        });
    }

    public findById(id: number): DepreciationsEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "DepreciationDate");
        return entity ?? undefined;
    }

    public create(entity: DepreciationsCreateEntity): number {
        EntityUtils.setLocalDate(entity, "DepreciationDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "DEPRECIATIONS",
            entity: entity,
            key: {
                name: "Id",
                column: "DEPRECIATIONS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DepreciationsUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "DepreciationDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "DEPRECIATIONS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "DEPRECIATIONS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DepreciationsCreateEntity | DepreciationsUpdateEntity): number {
        const id = (entity as DepreciationsUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DepreciationsUpdateEntity);
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
            table: "DEPRECIATIONS",
            entity: entity,
            key: {
                name: "Id",
                column: "DEPRECIATIONS_ID",
                value: id
            }
        });
    }

    public count(options?: DepreciationsEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "DEPRECIATIONS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DepreciationsEntityEvent | DepreciationsUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-plutus-entities-Depreciations", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-plutus-entities-Depreciations").send(JSON.stringify(data));
    }
}
