import { RABBITMQ_SERVICE } from '@app/common/constants/injection-tokens';
import { NotificationStatus } from '@app/common/types/notifications.type';
import { Notification } from '@app/modules/notifications/entities/notification.entity';
import { NotificationsService } from '@app/modules/notifications/notifications.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn()
  };

  const mockClient = {
    emit: jest.fn()
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository
        },
        {
          provide: RABBITMQ_SERVICE,
          useValue: mockClient
        }
      ]
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => jest.clearAllMocks);

  describe('create', () => {
    it('should save the notification with pending status', async () => {
      const dto = { channel: 'email', recipient: 'a@a.com', message: 'hi', priority: 'high' };
      const saved = { id: 'uuid-1', ...dto, status: 'pending' };

      mockRepository.create.mockReturnValue(saved);
      mockRepository.save.mockReturnValue(saved);

      const created = await service.create(dto as any);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockClient.emit).toHaveBeenCalled();
      expect(created.status).toBe('pending');
    });
  });

  describe('findById', () => {
    it('should return notification by id', async () => {
      const notification = { id: 'uuid-1', status: 'pending' };
      mockRepository.findOne.mockResolvedValue(notification);

      const result = await service.findById('uuid-1');
      expect(result).toEqual(notification);
    });

    it('should return null if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findById('?');
      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update notification status', async () => {
      const notification = { id: 'uuid-1', status: 'pending' };
      mockRepository.findOne.mockResolvedValue(notification);
      mockRepository.save.mockResolvedValue({ ...notification, status: 'sent' });

      await service.updateStatus('uuid-1', NotificationStatus.SENT);
      expect(mockRepository.save).toHaveBeenCalledWith({ id: 'uuid-1', status: 'sent' });
    });

    it('should throw NotFoundException if notification not found', async () => {
      (mockRepository.findOne.mockResolvedValue(null),
        await expect(service.updateStatus('?', NotificationStatus.SENT)).rejects.toThrow('Notification not found'));
    });
  });
});
