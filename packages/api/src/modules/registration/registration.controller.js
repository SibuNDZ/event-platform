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
exports.RegistrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const registration_service_1 = require("./registration.service");
const public_decorator_1 = require("../../core/auth/decorators/public.decorator");
let RegistrationController = class RegistrationController {
    registrationService;
    constructor(registrationService) {
        this.registrationService = registrationService;
    }
    async register(eventId, dto) {
        return this.registrationService.register(eventId, dto);
    }
};
exports.RegistrationController = RegistrationController;
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register for an event' }),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RegistrationController.prototype, "register", null);
exports.RegistrationController = RegistrationController = __decorate([
    (0, swagger_1.ApiTags)('registration'),
    (0, common_1.Controller)({ path: 'events/:eventId/register', version: '1' }),
    __metadata("design:paramtypes", [registration_service_1.RegistrationService])
], RegistrationController);
//# sourceMappingURL=registration.controller.js.map