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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const opossum_1 = __importDefault(require("opossum"));
const bottleneck_1 = __importDefault(require("bottleneck"));
async function retryRequest(fn, retries = 3) {
    try {
        return await fn();
    }
    catch (err) {
        console.log(`[Retry] Failed, retries left: ${retries - 1}`);
        if (retries <= 0)
            throw err;
        return retryRequest(fn, retries - 1);
    }
}
const breaker = new opossum_1.default(async () => {
    const axios = require('axios');
    return axios.get('http://localhost:3001/b/data');
}, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
});
breaker.fallback(() => {
    console.log('[Circuit Breaker] OPEN - Returning fallback');
    return { data: 'Circuit Breaker OPEN - Fallback response' };
});
breaker.on('open', () => console.log('[Circuit Breaker] OPEN'));
breaker.on('halfOpen', () => console.log('[Circuit Breaker] HALF_OPEN'));
breaker.on('close', () => console.log('[Circuit Breaker] CLOSED'));
let lastRequestTime = 0;
const RATE_LIMIT_WINDOW = 3000;
const bulkhead = new bottleneck_1.default({
    maxConcurrent: 2,
});
let AppController = class AppController {
    httpService;
    constructor(httpService) {
        this.httpService = httpService;
    }
    getHello() {
        return 'Service A - Fault Tolerance Lab';
    }
    async retry() {
        console.log('[Retry] Starting request with retry logic');
        try {
            const result = await retryRequest(async () => {
                const response = await this.httpService.axiosRef.get('http://localhost:3001/b/data');
                console.log('[Retry] Success!');
                return response.data;
            });
            return { success: true, data: result };
        }
        catch (error) {
            console.log('[Retry] All retries exhausted');
            return { success: false, error: error.message };
        }
    }
    async circuitBreaker() {
        console.log('[Circuit Breaker] Firing request');
        try {
            const result = await breaker.fire();
            return { success: true, data: result.data };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        console.log(`[Rate Limiter] Time since last request: ${timeSinceLastRequest}ms`);
        if (lastRequestTime > 0 && timeSinceLastRequest < RATE_LIMIT_WINDOW) {
            const retryAfter = Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastRequest) / 1000);
            console.log(`[Rate Limiter] Rate limit exceeded - Returning 429`);
            throw new common_1.HttpException({
                statusCode: 429,
                message: 'Too Many Requests - Rate limit exceeded (1 request per 3 seconds)',
                retryAfter: `${retryAfter} seconds`
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        lastRequestTime = now;
        console.log('[Rate Limiter] Processing request');
        try {
            const response = await this.httpService.axiosRef.get('http://localhost:3001/b/data');
            return { success: true, data: response.data };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async bulkhead() {
        console.log('[Bulkhead] Scheduling request');
        try {
            const result = await bulkhead.schedule(async () => {
                console.log('[Bulkhead] Executing request (max 2 concurrent)');
                const response = await this.httpService.axiosRef.get('http://localhost:3001/b/data');
                return response.data;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('retry'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "retry", null);
__decorate([
    (0, common_1.Get)('cb'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "circuitBreaker", null);
__decorate([
    (0, common_1.Get)('rate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "rateLimit", null);
__decorate([
    (0, common_1.Get)('bulk'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "bulkhead", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object])
], AppController);
//# sourceMappingURL=app.controller.js.map