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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
let StripeService = class StripeService {
    configService;
    stripe;
    constructor(configService) {
        this.configService = configService;
        const secretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (secretKey) {
            this.stripe = new stripe_1.default(secretKey, {
                apiVersion: '2024-04-10',
            });
        }
    }
    async createPaymentIntent(amount, currency, metadata) {
        if (!this.stripe) {
            throw new Error('Stripe not configured');
        }
        return this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata,
        });
    }
    async createCheckoutSession(params) {
        if (!this.stripe) {
            throw new Error('Stripe not configured');
        }
        return this.stripe.checkout.sessions.create(params);
    }
    async constructWebhookEvent(body, signature) {
        if (!this.stripe) {
            throw new Error('Stripe not configured');
        }
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('Stripe webhook secret not configured');
        }
        return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map