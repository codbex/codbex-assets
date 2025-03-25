import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { DepreciationRepository, DepreciationEntityOptions } from "../../dao/Asset/DepreciationRepository";
import { user } from "sdk/security"
import { ForbiddenError } from "../utils/ForbiddenError";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-assets-Asset-Depreciation", ["validate"]);

@Controller
class DepreciationService {

    private readonly repository = new DepreciationRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            this.checkPermissions("read");
            const options: DepreciationEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            let Asset = parseInt(ctx.queryParameters.Asset);
            Asset = isNaN(Asset) ? ctx.queryParameters.Asset : Asset;

            if (Asset !== undefined) {
                options.$filter = {
                    equals: {
                        Asset: Asset
                    }
                };
            }

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            this.checkPermissions("write");
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-assets/gen/codbex-assets/api/Asset/DepreciationService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            this.checkPermissions("read");
            return this.repository.count();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            this.checkPermissions("read");
            return this.repository.count(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            this.checkPermissions("read");
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            this.checkPermissions("read");
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound("Depreciation not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            this.checkPermissions("write");
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
            this.checkPermissions("write");
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("Depreciation not found");
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

    private checkPermissions(operationType: string) {
        if (operationType === "read" && !(user.isInRole("codbex-assets.Asset.DepreciationReadOnly") || user.isInRole("codbex-assets.Asset.DepreciationFullAccess"))) {
            throw new ForbiddenError();
        }
        if (operationType === "write" && !user.isInRole("codbex-assets.Asset.DepreciationFullAccess")) {
            throw new ForbiddenError();
        }
    }

    private validateEntity(entity: any): void {
        if (entity.Asset === null || entity.Asset === undefined) {
            throw new ValidationError(`The 'Asset' property is required, provide a valid value`);
        }
        if (entity.DepreciationStartDate === null || entity.DepreciationStartDate === undefined) {
            throw new ValidationError(`The 'DepreciationStartDate' property is required, provide a valid value`);
        }
        if (entity.DeprecationEndDate === null || entity.DeprecationEndDate === undefined) {
            throw new ValidationError(`The 'DeprecationEndDate' property is required, provide a valid value`);
        }
        if (entity.LastDeprecationDate === null || entity.LastDeprecationDate === undefined) {
            throw new ValidationError(`The 'LastDeprecationDate' property is required, provide a valid value`);
        }
        if (entity.DeprecationRate === null || entity.DeprecationRate === undefined) {
            throw new ValidationError(`The 'DeprecationRate' property is required, provide a valid value`);
        }
        if (entity.Method === null || entity.Method === undefined) {
            throw new ValidationError(`The 'Method' property is required, provide a valid value`);
        }
        if (entity.Method?.length > 64) {
            throw new ValidationError(`The 'Method' exceeds the maximum length of [64] characters`);
        }
        if (entity.AnnualDepreciation === null || entity.AnnualDepreciation === undefined) {
            throw new ValidationError(`The 'AnnualDepreciation' property is required, provide a valid value`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
