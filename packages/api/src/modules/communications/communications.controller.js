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
exports.CommunicationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_service_1 = require("./email.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../core/tenant/tenant.guard");
const tenant_decorator_1 = require("../../core/tenant/tenant.decorator");
let CommunicationsController = class CommunicationsController {
    emailService;
    constructor(emailService) {
        this.emailService = emailService;
    }
    async sendTest(dto) {
        const success = await this.emailService.send({
            to: dto.to,
            subject: 'Test Email from Event Platform',
            html: '<h1>Test Email</h1><p>This is a test email from your event platform.</p>',
        });
        return { success };
    }
};
exports.CommunicationsController = CommunicationsController;
__decorate([
    (0, common_1.Post)('send-test'),
    (0, tenant_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Send test email' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "sendTest", null);
exports.CommunicationsController = CommunicationsController = __decorate([
    (0, swagger_1.ApiTags)('communications'),
    (0, common_1.Controller)({ path: 'communications', version: '1' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], CommunicationsController);
//# sourceMappingURL=communications.controller.js.map