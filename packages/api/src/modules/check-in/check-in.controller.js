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
exports.CheckInController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const check_in_service_1 = require("./check-in.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../core/tenant/tenant.guard");
const tenant_decorator_1 = require("../../core/tenant/tenant.decorator");
let CheckInController = class CheckInController {
    checkInService;
    constructor(checkInService) {
        this.checkInService = checkInService;
    }
    async checkIn(dto) {
        return this.checkInService.checkIn(dto);
    }
    async getStats(eventId) {
        return this.checkInService.getCheckInStats(eventId);
    }
    async undoCheckIn(id) {
        await this.checkInService.undoCheckIn(id);
    }
};
exports.CheckInController = CheckInController;
__decorate([
    (0, common_1.Post)(),
    (0, tenant_decorator_1.Roles)('STAFF'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check in attendee by QR code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Get)('stats/:eventId'),
    (0, tenant_decorator_1.Roles)('VIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get check-in statistics for event' }),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "getStats", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Undo check-in' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "undoCheckIn", null);
exports.CheckInController = CheckInController = __decorate([
    (0, swagger_1.ApiTags)('check-in'),
    (0, common_1.Controller)({ path: 'check-in', version: '1' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [check_in_service_1.CheckInService])
], CheckInController);
//# sourceMappingURL=check-in.controller.js.map