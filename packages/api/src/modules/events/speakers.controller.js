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
exports.SpeakersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const speakers_service_1 = require("./speakers.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../core/tenant/tenant.guard");
const tenant_decorator_1 = require("../../core/tenant/tenant.decorator");
let SpeakersController = class SpeakersController {
    speakersService;
    constructor(speakersService) {
        this.speakersService = speakersService;
    }
    async create(eventId, dto) {
        return this.speakersService.create(eventId, dto);
    }
    async findAll(eventId) {
        return this.speakersService.findByEvent(eventId);
    }
    async findOne(id) {
        return this.speakersService.findOne(id);
    }
    async update(id, dto) {
        return this.speakersService.update(id, dto);
    }
    async delete(id) {
        await this.speakersService.delete(id);
    }
};
exports.SpeakersController = SpeakersController;
__decorate([
    (0, common_1.Post)(),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a speaker' }),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SpeakersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, tenant_decorator_1.Roles)('VIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all speakers for event' }),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, tenant_decorator_1.Roles)('VIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get speaker by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update speaker' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SpeakersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete speaker' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakersController.prototype, "delete", null);
exports.SpeakersController = SpeakersController = __decorate([
    (0, swagger_1.ApiTags)('speakers'),
    (0, common_1.Controller)({ path: 'events/:eventId/speakers', version: '1' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [speakers_service_1.SpeakersService])
], SpeakersController);
//# sourceMappingURL=speakers.controller.js.map