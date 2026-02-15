import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return health status', () => {
        const result = controller.health();
        expect(result.status).toBe('ok');
        expect(result.timestamp).toBeDefined();
    });

    it('should return root message', () => {
        const result = controller.root();
        expect(result.message).toBe('Event Platform API');
        expect(result.version).toBe('1.0.0');
    });
});
