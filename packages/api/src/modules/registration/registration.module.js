"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationModule = void 0;
const common_1 = require("@nestjs/common");
const registration_service_1 = require("./registration.service");
const registration_controller_1 = require("./registration.controller");
const ticket_types_service_1 = require("./ticket-types.service");
const ticket_types_controller_1 = require("./ticket-types.controller");
const attendees_service_1 = require("./attendees.service");
const attendees_controller_1 = require("./attendees.controller");
let RegistrationModule = class RegistrationModule {
};
exports.RegistrationModule = RegistrationModule;
exports.RegistrationModule = RegistrationModule = __decorate([
    (0, common_1.Module)({
        controllers: [registration_controller_1.RegistrationController, ticket_types_controller_1.TicketTypesController, attendees_controller_1.AttendeesController],
        providers: [registration_service_1.RegistrationService, ticket_types_service_1.TicketTypesService, attendees_service_1.AttendeesService],
        exports: [registration_service_1.RegistrationService, ticket_types_service_1.TicketTypesService, attendees_service_1.AttendeesService],
    })
], RegistrationModule);
//# sourceMappingURL=registration.module.js.map