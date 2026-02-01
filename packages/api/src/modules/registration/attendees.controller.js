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
exports.AttendeesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attendees_service_1 = require("./attendees.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../core/tenant/tenant.guard");
const tenant_decorator_1 = require("../../core/tenant/tenant.decorator");
let AttendeesController = class AttendeesController {
    attendeesService;
    constructor(attendeesService) {
        this.attendeesService = attendeesService;
    }
    async findAll(eventId, query) {
        return this.attendeesService.findByEvent(eventId, query);
    }
    async findOne(id) {
        return this.attendeesService.findOne(id);
    }
    async update(id, dto) {
        return this.attendeesService.update(id, dto);
    }
};
exports.AttendeesController = AttendeesController;
__decorate([
    (0, common_1.Get)(),
    (0, tenant_decorator_1.Roles)('STAFF'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendees for event' }),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, tenant_decorator_1.Roles)('STAFF'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendee by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, tenant_decorator_1.Roles)('STAFF'),
    (0, swagger_1.ApiOperation)({ summary: 'Update attendee' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "update", null);
exports.AttendeesController = AttendeesController = __decorate([
    (0, swagger_1.ApiTags)('attendees'),
    (0, common_1.Controller)({ path: 'events/:eventId/attendees', version: '1' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [attendees_service_1.AttendeesService])
], AttendeesController);
//# sourceMappingURL=attendees.controller.js.map