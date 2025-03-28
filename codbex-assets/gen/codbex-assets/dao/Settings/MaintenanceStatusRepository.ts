import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface MaintenanceStatusEntity {
    readonly Id: number;
    Name?: string;
}

export interface MaintenanceStatusCreateEntity {
    readonly Name?: string;
}

export interface MaintenanceStatusUpdateEntity extends MaintenanceStatusCreateEntity {
    readonly Id: number;
}

export interface MaintenanceStatusEntityOptions {
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
    $select?: (keyof MaintenanceStatusEntity)[],
    $sort?: string | (keyof MaintenanceStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface MaintenanceStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<MaintenanceStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface MaintenanceStatusUpdateEntityEvent extends MaintenanceStatusEntityEvent {
    readonly previousEntity: MaintenanceStatusEntity;
}

export class MaintenanceStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_MAINTENANCESTATUS",
        properties: [
            {
                name: "Id",
                column: "MAINTENANCESTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "MAINTENANCESTATUS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(MaintenanceStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: MaintenanceStatusEntityOptions): MaintenanceStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): MaintenanceStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: MaintenanceStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_MAINTENANCESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "MAINTENANCESTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: MaintenanceStatusUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_MAINTENANCESTATUS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "MAINTENANCESTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: MaintenanceStatusCreateEntity | MaintenanceStatusUpdateEntity): number {
        const id = (entity as MaintenanceStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as MaintenanceStatusUpdateEntity);
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
            table: "CODBEX_MAINTENANCESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "MAINTENANCESTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: MaintenanceStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_MAINTENANCESTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: MaintenanceStatusEntityEvent | MaintenanceStatusUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-Settings-MaintenanceStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-Settings-MaintenanceStatus").send(JSON.stringify(data));
    }
}
