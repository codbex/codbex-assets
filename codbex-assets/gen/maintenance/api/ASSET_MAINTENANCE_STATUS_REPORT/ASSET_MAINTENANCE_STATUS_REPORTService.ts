import { Controller, Get, Post } from "sdk/http"
import { ASSET_MAINTENANCE_STATUS_REPORTRepository, ASSET_MAINTENANCE_STATUS_REPORTFilter, ASSET_MAINTENANCE_STATUS_REPORTPaginatedFilter } from "../../dao/ASSET_MAINTENANCE_STATUS_REPORT/ASSET_MAINTENANCE_STATUS_REPORTRepository";
import { HttpUtils } from "../utils/HttpUtils";

@Controller
class ASSET_MAINTENANCE_STATUS_REPORTService {

    private readonly repository = new ASSET_MAINTENANCE_STATUS_REPORTRepository();

    @Get("/")
    public filter(_: any, ctx: any) {
        try {
            const filter: ASSET_MAINTENANCE_STATUS_REPORTPaginatedFilter = {
                "$limit": ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                "$offset": ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count(_: any, ctx: any) {
        try {
            const filter: ASSET_MAINTENANCE_STATUS_REPORTFilter = {
            };
            return this.repository.count(filter);
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

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

}