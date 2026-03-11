import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PluginRegistryService } from './core/plugin-registry/plugin-registry.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockPluginRegistry: Partial<PluginRegistryService> = {
      getAll: () => [],
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PluginRegistryService, useValue: mockPluginRegistry },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return CMS info with Microkernel architecture', () => {
      const info = appController.getCmsInfo() as Record<string, any>;
      expect(info.architecture).toBe('Microkernel');
      expect(info.name).toBe('MicrokernelCMS');
    });
  });
});
