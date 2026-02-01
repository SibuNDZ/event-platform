"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@event-platform/shared");
let TenantService = class TenantService {
    context = null;
    setContext(context) {
        this.context = context;
    }
    getContext() {
        return this.context;
    }
    getOrganizationId() {
        return this.context?.organizationId || null;
    }
    getUserId() {
        return this.context?.userId || null;
    }
    getRole() {
        return this.context?.role || null;
    }
    getOrganization() {
        return this.context?.organization || null;
    }
    getTierFeatures() {
        const org = this.context?.organization;
        if (!org)
            return null;
        return shared_1.TIER_FEATURES[org.licenseTier] || shared_1.TIER_FEATURES.STANDARD;
    }
    hasFeature(feature) {
        const features = this.getTierFeatures();
        if (!features)
            return false;
        const value = features[feature];
        if (typeof value === 'boolean')
            return value;
        if (typeof value === 'number')
            return value !== 0;
        if (typeof value === 'string')
            return value !== 'none';
        if (Array.isArray(value))
            return value.length > 0;
        return false;
    }
    isOwner() {
        return this.context?.role === 'OWNER';
    }
    isAdmin() {
        return this.context?.role === 'OWNER' || this.context?.role === 'ADMIN';
    }
    isStaff() {
        return this.isAdmin() || this.context?.role === 'STAFF';
    }
    canManageOrganization() {
        return this.isOwner();
    }
    canManageEvents() {
        return this.isAdmin();
    }
    canManageAttendees() {
        return this.isStaff();
    }
    canViewOnly() {
        return this.context?.role === 'VIEWER';
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST })
], TenantService);
//# sourceMappingURL=tenant.service.js.map