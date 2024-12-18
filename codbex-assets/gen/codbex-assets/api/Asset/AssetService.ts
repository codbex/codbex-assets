import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { AssetRepository, AssetEntityOptions } from "../../dao/Asset/AssetRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-assets-Asset-Asset", ["validate"]);

@Controller
class AssetService {

    private readonly repository = new AssetRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: AssetEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-assets/gen/codbex-assets/api/Asset/AssetService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            return this.repository.count();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            return this.repository.count(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound("Asset not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            entity.Id = ctx.pathParameters.id;
            this.validateEntity(entity);
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Delete("/:id")
    public deleteById(_: any, ctx: any) {
        try {
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("Asset not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

    private validateEntity(entity: any): void {
        if (entity.Name === null || entity.Name === undefined) {
            throw new ValidationError(`The 'Name' property is required, provide a valid value`);
        }
        if (entity.Name?.length > 128) {
            throw new ValidationError(`The 'Name' exceeds the maximum length of [128] characters`);
        }
        if (entity.Company === null || entity.Company === undefined) {
            throw new ValidationError(`The 'Company' property is required, provide a valid value`);
        }
        if (entity.SerialNumber?.length > 20) {
            throw new ValidationError(`The 'SerialNumber' exceeds the maximum length of [20] characters`);
        }
        if (entity.PurchaseDate === null || entity.PurchaseDate === undefined) {
            throw new ValidationError(`The 'PurchaseDate' property is required, provide a valid value`);
        }
        if (entity.AquiredValue === null || entity.AquiredValue === undefined) {
            throw new ValidationError(`The 'AquiredValue' property is required, provide a valid value`);
        }
        if (entity.UsefulLife === null || entity.UsefulLife === undefined) {
            throw new ValidationError(`The 'UsefulLife' property is required, provide a valid value`);
        }
        if (entity.ResidualValue === null || entity.ResidualValue === undefined) {
            throw new ValidationError(`The 'ResidualValue' property is required, provide a valid value`);
        }
        if (entity.Product === null || entity.Product === undefined) {
            throw new ValidationError(`The 'Product' property is required, provide a valid value`);
        }
        if (entity.Store === null || entity.Store === undefined) {
            throw new ValidationError(`The 'Store' property is required, provide a valid value`);
        }
        if (entity.PurchaseInvoice === null || entity.PurchaseInvoice === undefined) {
            throw new ValidationError(`The 'PurchaseInvoice' property is required, provide a valid value`);
        }
        if (entity.TotalOperationCost === null || entity.TotalOperationCost === undefined) {
            throw new ValidationError(`The 'TotalOperationCost' property is required, provide a valid value`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
