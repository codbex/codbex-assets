import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface MaintenancesEntity {
    readonly Id: number;
    Asset?: number;
    MaintenanceDate?: Date;
    Description?: string;
    Cost?: number;
    Status?: string;
}

export interface MaintenancesCreateEntity {
    readonly Asset?: number;
    readonly MaintenanceDate?: Date;
    readonly Description?: string;
    readonly Cost?: number;
    readonly Status?: string;
}

export interface MaintenancesUpdateEntity extends MaintenancesCreateEntity {
    readonly Id: number;
}

export interface MaintenancesEntityOptions {
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
    $select?: (keyof MaintenancesEntity)[],
    $sort?: string | (keyof MaintenancesEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface MaintenancesEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<MaintenancesEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface MaintenancesUpdateEntityEvent extends MaintenancesEntityEvent {
    readonly previousEntity: MaintenancesEntity;
}

export class MaintenancesRepository {

    private static readonly DEFINITION = {
        table: "MAINTENANCES",
        properties: [
            {
                name: "Id",
                column: "MAINTENANCES_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Asset",
                column: "MAINTENANCES_ASSET",
                type: "INTEGER",
            },
            {
                name: "MaintenanceDate",
                column: "MAINTENANCES_MAINTENANCEDATE",
                type: "DATE",
            },
            {
                name: "Description",
                column: "MAINTENANCES_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Cost",
                column: "MAINTENANCES_COST",
                type: "DECIMAL",
            },
            {
                name: "Status",
                column: "MAINTENANCES_STATUS",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(MaintenancesRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: MaintenancesEntityOptions): MaintenancesEntity[] {
        return this.dao.list(options).map((e: MaintenancesEntity) => {
            EntityUtils.setDate(e, "MaintenanceDate");
            return e;
        });
    }

    public findById(id: number): MaintenancesEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "MaintenanceDate");
        return entity ?? undefined;
    }

    public create(entity: MaintenancesCreateEntity): number {
        EntityUtils.setLocalDate(entity, "MaintenanceDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "MAINTENANCES",
            entity: entity,
            key: {
                name: "Id",
                column: "MAINTENANCES_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: MaintenancesUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "MaintenanceDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "MAINTENANCES",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "MAINTENANCES_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: MaintenancesCreateEntity | MaintenancesUpdateEntity): number {
        const id = (entity as MaintenancesUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as MaintenancesUpdateEntity);
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
            table: "MAINTENANCES",
            entity: entity,
            key: {
                name: "Id",
                column: "MAINTENANCES_ID",
                value: id
            }
        });
    }

    public count(options?: MaintenancesEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "MAINTENANCES"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: MaintenancesEntityEvent | MaintenancesUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-plutus-entities-Maintenances", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-plutus-entities-Maintenances").send(JSON.stringify(data));
    }
}
