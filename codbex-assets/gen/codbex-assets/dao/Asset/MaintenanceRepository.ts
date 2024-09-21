import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface MaintenanceEntity {
    readonly Id: number;
    Asset?: number;
    MaintenanceDate?: Date;
    Description?: string;
    Cost?: number;
    Status?: string;
}

export interface MaintenanceCreateEntity {
    readonly Asset?: number;
    readonly MaintenanceDate?: Date;
    readonly Description?: string;
    readonly Cost?: number;
    readonly Status?: string;
}

export interface MaintenanceUpdateEntity extends MaintenanceCreateEntity {
    readonly Id: number;
}

export interface MaintenanceEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Asset?: number | number[];
            MaintenanceDate?: Date | Date[];
            Description?: string | string[];
            Cost?: number | number[];
            Status?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Asset?: number | number[];
            MaintenanceDate?: Date | Date[];
            Description?: string | string[];
            Cost?: number | number[];
            Status?: string | string[];
        };
        contains?: {
            Id?: number;
            Asset?: number;
            MaintenanceDate?: Date;
            Description?: string;
            Cost?: number;
            Status?: string;
        };
        greaterThan?: {
            Id?: number;
            Asset?: number;
            MaintenanceDate?: Date;
            Description?: string;
            Cost?: number;
            Status?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Asset?: number;
            MaintenanceDate?: Date;
            Description?: string;
            Cost?: number;
            Status?: string;
        };
        lessThan?: {
            Id?: number;
            Asset?: number;
            MaintenanceDate?: Date;
            Description?: string;
            Cost?: number;
            Status?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Asset?: number;
            MaintenanceDate?: Date;
            Description?: string;
            Cost?: number;
            Status?: string;
        };
    },
    $select?: (keyof MaintenanceEntity)[],
    $sort?: string | (keyof MaintenanceEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface MaintenanceEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<MaintenanceEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface MaintenanceUpdateEntityEvent extends MaintenanceEntityEvent {
    readonly previousEntity: MaintenanceEntity;
}

export class MaintenanceRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_MAINTENANCE",
        properties: [
            {
                name: "Id",
                column: "MAINTENANCE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Asset",
                column: "MAINTENANCE_ASSET",
                type: "INTEGER",
            },
            {
                name: "MaintenanceDate",
                column: "MAINTENANCE_MAINTENANCEDATE",
                type: "DATE",
            },
            {
                name: "Description",
                column: "MAINTENANCE_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Cost",
                column: "MAINTENANCE_COST",
                type: "DECIMAL",
            },
            {
                name: "Status",
                column: "MAINTENANCE_STATUS",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(MaintenanceRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: MaintenanceEntityOptions): MaintenanceEntity[] {
        return this.dao.list(options).map((e: MaintenanceEntity) => {
            EntityUtils.setDate(e, "MaintenanceDate");
            return e;
        });
    }

    public findById(id: number): MaintenanceEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "MaintenanceDate");
        return entity ?? undefined;
    }

    public create(entity: MaintenanceCreateEntity): number {
        EntityUtils.setLocalDate(entity, "MaintenanceDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_MAINTENANCE",
            entity: entity,
            key: {
                name: "Id",
                column: "MAINTENANCE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: MaintenanceUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "MaintenanceDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_MAINTENANCE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "MAINTENANCE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: MaintenanceCreateEntity | MaintenanceUpdateEntity): number {
        const id = (entity as MaintenanceUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as MaintenanceUpdateEntity);
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
            table: "CODBEX_MAINTENANCE",
            entity: entity,
            key: {
                name: "Id",
                column: "MAINTENANCE_ID",
                value: id
            }
        });
    }

    public count(options?: MaintenanceEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_MAINTENANCE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: MaintenanceEntityEvent | MaintenanceUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-Asset-Maintenance", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-Asset-Maintenance").send(JSON.stringify(data));
    }
}
