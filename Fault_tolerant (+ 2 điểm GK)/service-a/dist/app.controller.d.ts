import { HttpService } from '@nestjs/axios';
export declare class AppController {
    private readonly httpService;
    constructor(httpService: HttpService);
    getHello(): string;
    retry(): unknown;
    circuitBreaker(): unknown;
    rateLimit(): unknown;
    bulkhead(): unknown;
}
