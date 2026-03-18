import { Controller, Get } from '@nestjs/common';

let count = 0;

@Controller('b')
export class AppController {
  @Get('data')
  getData() {
    count++;
    const requestId = count;
    console.log(`[Service B] Request #${requestId} - START`);

    //Giả lập lỗi ngẫu nhiên để test Retry và Circuit Breaker
    // if (Math.random() < 0.5) {
    //   console.log(`[Service B] Request #${requestId} - ERROR`);
    //   throw new Error('Lỗi ngẫu nhiên từ Service B');
    // }

    // Giả lập xử lý chậm 3 giây để test Bulkhead
      // return new Promise((resolve) => {
      //   setTimeout(() => {
      //     console.log(`[Service B] Request #${requestId} - DONE`);
      //     resolve(`Response từ Service B (Request #${requestId})`);
      //   }, 3000);
      // });
    return "Response từ Service B";
  }
}
