import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface DepreciationEntity {
    readonly Id: number;
    Asset?: number;
    DepreciationStartDate?: Date;
    DeprecationEndDate?: Date;
    DeprecationSchedule?: number;
    LastDeprecationDate?: Date;
    DeprecationRate?: number;
    Method?: string;
    AnnualDepreciation?: number;
    AccumulatedDepreciation?: number;
}

export interface DepreciationCreateEntity {
    readonly Asset?: number;
    readonly DepreciationStartDate?: Date;
    readonly DeprecationEndDate?: Date;
    readonly DeprecationSchedule?: number;
    readonly LastDeprecationDate?: Date;
    readonly DeprecationRate?: number;
    readonly Method?: string;
    readonly AnnualDepreciation?: number;
    readonly AccumulatedDepreciation?: number;
}

export interface DepreciationUpdateEntity extends DepreciationCreateEntity {
    readonly Id: number;
}

export interface DepreciationEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Asset?: number | number[];
            DepreciationStartDate?: Date | Date[];
            DeprecationEndDate?: Date | Date[];
            DeprecationSchedule?: number | number[];
            LastDeprecationDate?: Date | Date[];
            DeprecationRate?: number | number[];
            Method?: string | string[];
            AnnualDepreciation?: number | number[];
            AccumulatedDepreciation?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Asset?: number | number[];
            DepreciationStartDate?: Date | Date[];
            DeprecationEndDate?: Date | Date[];
            DeprecationSchedule?: number | number[];
            LastDeprecationDate?: Date | Date[];
            DeprecationRate?: number | number[];
            Method?: string | string[];
            AnnualDepreciation?: number | number[];
            AccumulatedDepreciation?: number | number[];
        };
        contains?: {
            Id?: number;
            Asset?: number;
            DepreciationStartDate?: Date;
            DeprecationEndDate?: Date;
            DeprecationSchedule?: number;
            LastDeprecationDate?: Date;
            DeprecationRate?: number;
            Method?: string;
            AnnualDepreciation?: number;
            AccumulatedDepreciation?: number;
        };
        greaterThan?: {
            Id?: number;
            Asset?: number;
            DepreciationStartDate?: Date;
            DeprecationEndDate?: Date;
            DeprecationSchedule?: number;
            LastDeprecationDate?: Date;
            DeprecationRate?: number;
            Method?: string;
            AnnualDepreciation?: number;
            AccumulatedDepreciation?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Asset?: number;
            DepreciationStartDate?: Date;
            DeprecationEndDate?: Date;
            DeprecationSchedule?: number;
            LastDeprecationDate?: Date;
            DeprecationRate?: number;
            Method?: string;
            AnnualDepreciation?: number;
            AccumulatedDepreciation?: number;
        };
        lessThan?: {
            Id?: number;
            Asset?: number;
            DepreciationStartDate?: Date;
            DeprecationEndDate?: Date;
            DeprecationSchedule?: number;
            LastDeprecationDate?: Date;
            DeprecationRate?: number;
            Method?: string;
            AnnualDepreciation?: number;
            AccumulatedDepreciation?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Asset?: number;
            DepreciationStartDate?: Date;
            DeprecationEndDate?: Date;
            DeprecationSchedule?: number;
            LastDeprecationDate?: Date;
            DeprecationRate?: number;
            Method?: string;
            AnnualDepreciation?: number;
            AccumulatedDepreciation?: number;
        };
    },
    $select?: (keyof DepreciationEntity)[],
    $sort?: string | (keyof DepreciationEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DepreciationEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DepreciationEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface DepreciationUpdateEntityEvent extends DepreciationEntityEvent {
    readonly previousEntity: DepreciationEntity;
}

export class DepreciationRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_DEPRECIATION",
        properties: [
            {
                name: "Id",
                column: "DEPRECIATION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Asset",
                column: "DEPRECIATION_ASSET",
                type: "INTEGER",
            },
            {
                name: "DepreciationStartDate",
                column: "DEPRECIATION_DEPRECIATIONSTARTDATE",
                type: "DATE",
            },
            {
                name: "DeprecationEndDate",
                column: "DEPRECIATION_DEPRECATIONENDDATE",
                type: "DATE",
            },
            {
                name: "DeprecationSchedule",
                column: "DEPRECIATION_DEPRECATIONSCHEDULE",
                type: "INTEGER",
            },
            {
                name: "LastDeprecationDate",
                column: "DEPRECIATION_LASTDEPRECATIONDATE",
                type: "DATE",
            },
            {
                name: "DeprecationRate",
                column: "DEPRECIATION_DEPRECATIONRATE",
                type: "DECIMAL",
            },
            {
                name: "Method",
                column: "DEPRECIATION_METHOD",
                type: "VARCHAR",
            },
            {
                name: "AnnualDepreciation",
                column: "DEPRECIATION_ANNUALDEPRECIATION",
                type: "DECIMAL",
            },
            {
                name: "AccumulatedDepreciation",
                column: "DEPRECIATION_ACCUMULATEDDEPRECIATION",
                type: "DECIMAL",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DepreciationRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DepreciationEntityOptions): DepreciationEntity[] {
        return this.dao.list(options).map((e: DepreciationEntity) => {
            EntityUtils.setDate(e, "DepreciationStartDate");
            EntityUtils.setDate(e, "DeprecationEndDate");
            EntityUtils.setDate(e, "LastDeprecationDate");
            return e;
        });
    }

    public findById(id: number): DepreciationEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "DepreciationStartDate");
        EntityUtils.setDate(entity, "DeprecationEndDate");
        EntityUtils.setDate(entity, "LastDeprecationDate");
        return entity ?? undefined;
    }

    public create(entity: DepreciationCreateEntity): number {
        EntityUtils.setLocalDate(entity, "DepreciationStartDate");
        EntityUtils.setLocalDate(entity, "DeprecationEndDate");
        EntityUtils.setLocalDate(entity, "LastDeprecationDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_DEPRECIATION",
            entity: entity,
            key: {
                name: "Id",
                column: "DEPRECIATION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DepreciationUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "DepreciationStartDate");
        // EntityUtils.setLocalDate(entity, "DeprecationEndDate");
        // EntityUtils.setLocalDate(entity, "LastDeprecationDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_DEPRECIATION",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "DEPRECIATION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DepreciationCreateEntity | DepreciationUpdateEntity): number {
        const id = (entity as DepreciationUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DepreciationUpdateEntity);
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
            table: "CODBEX_DEPRECIATION",
            entity: entity,
            key: {
                name: "Id",
                column: "DEPRECIATION_ID",
                value: id
            }
        });
    }

    public count(options?: DepreciationEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_DEPRECIATION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DepreciationEntityEvent | DepreciationUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-Asset-Depreciation", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-Asset-Depreciation").send(JSON.stringify(data));
    }
}
