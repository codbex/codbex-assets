import { Controller, Get, Post } from "sdk/http"
import { ASSET_VALUATION_DEPRECIATION_REPORTRepository, ASSET_VALUATION_DEPRECIATION_REPORTFilter, ASSET_VALUATION_DEPRECIATION_REPORTPaginatedFilter } from "../../dao/ASSET_VALUATION_DEPRECIATION_REPORT/ASSET_VALUATION_DEPRECIATION_REPORTRepository";
import { HttpUtils } from "../utils/HttpUtils";

@Controller
class ASSET_VALUATION_DEPRECIATION_REPORTService {

    private readonly repository = new ASSET_VALUATION_DEPRECIATION_REPORTRepository();

    @Get("/")
    public filter(_: any, ctx: any) {
        try {
            const filter: ASSET_VALUATION_DEPRECIATION_REPORTPaginatedFilter = {
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
            const filter: ASSET_VALUATION_DEPRECIATION_REPORTFilter = {
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