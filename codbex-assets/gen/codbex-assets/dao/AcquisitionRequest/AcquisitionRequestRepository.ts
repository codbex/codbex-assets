import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface AcquisitionRequestEntity {
    readonly Id: number;
    Asset?: number;
    AcquisitionDate?: Date;
    Cost?: number;
}

export interface AcquisitionRequestCreateEntity {
    readonly Asset?: number;
    readonly AcquisitionDate?: Date;
    readonly Cost?: number;
}

export interface AcquisitionRequestUpdateEntity extends AcquisitionRequestCreateEntity {
    readonly Id: number;
}

export interface AcquisitionRequestEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Asset?: number | number[];
            AcquisitionDate?: Date | Date[];
            Cost?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Asset?: number | number[];
            AcquisitionDate?: Date | Date[];
            Cost?: number | number[];
        };
        contains?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
        };
        greaterThan?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
        };
        lessThan?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Asset?: number;
            AcquisitionDate?: Date;
            Cost?: number;
        };
    },
    $select?: (keyof AcquisitionRequestEntity)[],
    $sort?: string | (keyof AcquisitionRequestEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AcquisitionRequestEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AcquisitionRequestEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface AcquisitionRequestUpdateEntityEvent extends AcquisitionRequestEntityEvent {
    readonly previousEntity: AcquisitionRequestEntity;
}

export class AcquisitionRequestRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ACQUISITION",
        properties: [
            {
                name: "Id",
                column: "ACQUISITION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Asset",
                column: "ACQUISITION_ASSET",
                type: "INTEGER",
            },
            {
                name: "AcquisitionDate",
                column: "ACQUISITION_ACQUISITIONDATE",
                type: "DATE",
            },
            {
                name: "Cost",
                column: "ACQUISITION_COST",
                type: "DECIMAL",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AcquisitionRequestRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AcquisitionRequestEntityOptions): AcquisitionRequestEntity[] {
        return this.dao.list(options).map((e: AcquisitionRequestEntity) => {
            EntityUtils.setDate(e, "AcquisitionDate");
            return e;
        });
    }

    public findById(id: number): AcquisitionRequestEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "AcquisitionDate");
        return entity ?? undefined;
    }

    public create(entity: AcquisitionRequestCreateEntity): number {
        EntityUtils.setLocalDate(entity, "AcquisitionDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ACQUISITION",
            entity: entity,
            key: {
                name: "Id",
                column: "ACQUISITION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AcquisitionRequestUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "AcquisitionDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ACQUISITION",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "ACQUISITION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AcquisitionRequestCreateEntity | AcquisitionRequestUpdateEntity): number {
        const id = (entity as AcquisitionRequestUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AcquisitionRequestUpdateEntity);
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
            table: "CODBEX_ACQUISITION",
            entity: entity,
            key: {
                name: "Id",
                column: "ACQUISITION_ID",
                value: id
            }
        });
    }

    public count(options?: AcquisitionRequestEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ACQUISITION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AcquisitionRequestEntityEvent | AcquisitionRequestUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-AcquisitionRequest-AcquisitionRequest", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-AcquisitionRequest-AcquisitionRequest").send(JSON.stringify(data));
    }
}
