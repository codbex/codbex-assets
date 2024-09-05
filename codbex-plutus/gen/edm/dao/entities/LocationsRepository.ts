import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface LocationsEntity {
    readonly Id: number;
    Name?: string;
}

export interface LocationsCreateEntity {
    readonly Name?: string;
}

export interface LocationsUpdateEntity extends LocationsCreateEntity {
    readonly Id: number;
}

export interface LocationsEntityOptions {
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
    $select?: (keyof LocationsEntity)[],
    $sort?: string | (keyof LocationsEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface LocationsEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<LocationsEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface LocationsUpdateEntityEvent extends LocationsEntityEvent {
    readonly previousEntity: LocationsEntity;
}

export class LocationsRepository {

    private static readonly DEFINITION = {
        table: "LOCATIONS",
        properties: [
            {
                name: "Id",
                column: "LOCATIONS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "LOCATIONS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(LocationsRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: LocationsEntityOptions): LocationsEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): LocationsEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: LocationsCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "LOCATIONS",
            entity: entity,
            key: {
                name: "Id",
                column: "LOCATIONS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: LocationsUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "LOCATIONS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "LOCATIONS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: LocationsCreateEntity | LocationsUpdateEntity): number {
        const id = (entity as LocationsUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as LocationsUpdateEntity);
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
            table: "LOCATIONS",
            entity: entity,
            key: {
                name: "Id",
                column: "LOCATIONS_ID",
                value: id
            }
        });
    }

    public count(options?: LocationsEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "LOCATIONS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: LocationsEntityEvent | LocationsUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-plutus-entities-Locations", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-plutus-entities-Locations").send(JSON.stringify(data));
    }
}
