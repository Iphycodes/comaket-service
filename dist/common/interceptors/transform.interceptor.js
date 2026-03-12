"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformInterceptor = void 0;
const response_message_decorator_1 = require("../decorators/response-message.decorator");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const customMessage = Reflect.getMetadata(response_message_decorator_1.RESPONSE_MESSAGE, context.getHandler());
        return next.handle().pipe((0, operators_1.map)((data) => {
            const meta = {
                statusCode: response.statusCode,
                success: response.statusCode < 400,
                message: customMessage || 'Success',
                timestamp: new Date().toISOString(),
                path: request.url,
            };
            if (this.isPaginatedData(data)) {
                const { items, total, page, perPage, totalPages, ...rest } = data;
                meta.pagination = { total, page, perPage, totalPages };
                return { meta, data: items };
            }
            if (data && typeof data === 'object' && 'token' in data) {
                const { token, ...rest } = data;
                meta.token = token;
                return { meta, data: rest };
            }
            return { meta, data };
        }));
    }
    isPaginatedData(data) {
        return (data &&
            Array.isArray(data.items) &&
            typeof data.total === 'number' &&
            typeof data.page === 'number' &&
            typeof data.perPage === 'number' &&
            typeof data.totalPages === 'number');
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);
//# sourceMappingURL=transform.interceptor.js.map