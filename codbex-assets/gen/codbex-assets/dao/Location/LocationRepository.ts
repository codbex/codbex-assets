import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface LocationEntity {
    readonly Id: number;
    Name?: string;
}

export interface LocationCreateEntity {
    readonly Name?: string;
}

export interface LocationUpdateEntity extends LocationCreateEntity {
    readonly Id: number;
}

export interface LocationEntityOptions {
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
    $select?: (keyof LocationEntity)[],
    $sort?: string | (keyof LocationEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface LocationEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<LocationEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface LocationUpdateEntityEvent extends LocationEntityEvent {
    readonly previousEntity: LocationEntity;
}

export class LocationRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_LOCATION",
        properties: [
            {
                name: "Id",
                column: "LOCATION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "LOCATION_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(LocationRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: LocationEntityOptions): LocationEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): LocationEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: LocationCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_LOCATION",
            entity: entity,
            key: {
                name: "Id",
                column: "LOCATION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: LocationUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_LOCATION",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "LOCATION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: LocationCreateEntity | LocationUpdateEntity): number {
        const id = (entity as LocationUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as LocationUpdateEntity);
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
            table: "CODBEX_LOCATION",
            entity: entity,
            key: {
                name: "Id",
                column: "LOCATION_ID",
                value: id
            }
        });
    }

    public count(options?: LocationEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_LOCATION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: LocationEntityEvent | LocationUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-assets-Location-Location", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-assets-Location-Location").send(JSON.stringify(data));
    }
}
