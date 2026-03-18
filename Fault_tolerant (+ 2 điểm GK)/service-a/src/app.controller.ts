import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import CircuitBreaker from 'opossum';
import Bottleneck from 'bottleneck';

// Retry function
async function retryRequest(fn: () => Promise<any>, retries = 3): Promise<any> {
  try {
    return await fn();
  } catch (err) {
    console.log(`[Retry] Failed, retries left: ${retries - 1}`);
    if (retries <= 0) throw err;
    return retryRequest(fn, retries - 1);
  }
}

// Circuit Breaker setup
const breaker = new CircuitBreaker(
  async () => {
    const axios = require('axios');
    return axios.get('http://localhost:3001/b/data');
  },
  {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
  }
);

breaker.fallback(() => {
  console.log('[Circuit Breaker] OPEN - Returning fallback');
  return { data: 'Circuit Breaker OPEN - Fallback response' };
});

breaker.on('open', () => console.log('[Circuit Breaker] OPEN'));
breaker.on('halfOpen', () => console.log('[Circuit Breaker] HALF_OPEN'));
breaker.on('close', () => console.log('[Circuit Breaker] CLOSED'));

// Rate Limiter setup - Simple timestamp-based approach
let lastRequestTime = 0;
const RATE_LIMIT_WINDOW = 3000; // 3 seconds

// Bulkhead setup
const bulkhead = new Bottleneck({
  maxConcurrent: 2, // Only 2 concurrent requests
});

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  @Get()
  getHello(): string {
    return 'Service A - Fault Tolerance Lab';
  }

  // 1. RETRY Pattern
  @Get('retry')
  async retry() {
    console.log('[Retry] Starting request with retry logic');
    try {
      const result = await retryRequest(async () => {
        const response = await this.httpService.axiosRef.get(
          'http://localhost:3001/b/data'
        );
        console.log('[Retry] Success!');
        return response.data;
      });
      return { success: true, data: result };
    } catch (error) {
      console.log('[Retry] All retries exhausted');
      return { success: false, error: error.message };
    }
  }

  // 2. CIRCUIT BREAKER Pattern
  @Get('cb')
  async circuitBreaker() {
    console.log('[Circuit Breaker] Firing request');
    try {
      const result = await breaker.fire();
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 3. RATE LIMITER Pattern
  @Get('rate')
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    console.log(`[Rate Limiter] Time since last request: ${timeSinceLastRequest}ms`);
    
    // Nếu request đến quá nhanh (trong vòng 3 giây)
    if (lastRequestTime > 0 && timeSinceLastRequest < RATE_LIMIT_WINDOW) {
      const retryAfter = Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastRequest) / 1000);
      console.log(`[Rate Limiter] Rate limit exceeded - Returning 429`);
      
      throw new HttpException(
        {
          statusCode: 429,
          message: 'Too Many Requests - Rate limit exceeded (1 request per 3 seconds)',
          retryAfter: `${retryAfter} seconds`
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    
    // Cập nhật thời gian request cuối
    lastRequestTime = now;
    console.log('[Rate Limiter] Processing request');
    
    try {
      const response = await this.httpService.axiosRef.get(
        'http://localhost:3001/b/data'
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 4. BULKHEAD Pattern
  @Get('bulk')
  async bulkhead() {
    console.log('[Bulkhead] Scheduling request');
    try {
      const result = await bulkhead.schedule(async () => {
        console.log('[Bulkhead] Executing request (max 2 concurrent)');
        const response = await this.httpService.axiosRef.get(
          'http://localhost:3001/b/data'
        );
        return response.data;
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
