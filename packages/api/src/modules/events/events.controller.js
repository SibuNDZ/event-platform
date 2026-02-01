"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const events_service_1 = require("./events.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../core/tenant/tenant.guard");
const tenant_decorator_1 = require("../../core/tenant/tenant.decorator");
const public_decorator_1 = require("../../core/auth/decorators/public.decorator");
const event_dto_1 = require("./dto/event.dto");
let EventsController = class EventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    async create(dto) {
        return this.eventsService.create(dto);
    }
    async findAll(query) {
        return this.eventsService.findAll(query);
    }
    async findOne(id) {
        return this.eventsService.findOne(id);
    }
    async findBySlug(slug, organizationSlug) {
        return this.eventsService.findBySlug(slug, organizationSlug);
    }
    async update(id, dto) {
        return this.eventsService.update(id, dto);
    }
    async publish(id) {
        return this.eventsService.publish(id);
    }
    async unpublish(id) {
        return this.eventsService.unpublish(id);
    }
    async cancel(id) {
        return this.eventsService.cancel(id);
    }
    async delete(id) {
        await this.eventsService.delete(id);
    }
    async getStats(id) {
        return this.eventsService.getStats(id);
    }
    async duplicate(id) {
        return this.eventsService.duplicate(id);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new event' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Event created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, tenant_decorator_1.Roles)('VIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all events for organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Events retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_dto_1.EventQueryDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, tenant_decorator_1.Roles)('VIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('public/:slug'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get public event by slug' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Event slug' }),
    (0, swagger_1.ApiQuery)({ name: 'org', required: false, description: 'Organization slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('org')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Publish event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event published successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/unpublish'),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Unpublish event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event unpublished successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event cancelled successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Event deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, tenant_decorator_1.Roles)('VIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event statistics' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicate event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Event duplicated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "duplicate", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)('events'),
    (0, common_1.Controller)({ path: 'events', version: '1' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map