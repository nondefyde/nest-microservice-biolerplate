import { Injectable, Logger } from '@nestjs/common';
import * as Pusher from 'pusher';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PusherService {
  private readonly pusher: Pusher;
  private readonly chunkingOptions: { enabled: boolean; limit: number };
  private readonly logger = new Logger(PusherService.name);

  constructor(private config: ConfigService) {
    const pusherConfig = {
      key: config.get('worker.pusher.key'),
      appId: config.get('worker.pusher.appId'),
      secret: config.get('worker.pusher.secret'),
      cluster: config.get('worker.pusher.cluster'),
    };
    this.chunkingOptions = config.get('worker.pusher.chunkingOptions');
    this.pusher = new Pusher(pusherConfig);
    if (
      this.chunkingOptions &&
      this.chunkingOptions?.enabled &&
      this.chunkingOptions?.limit > 10000
    ) {
      this.logger.warn(
        `Pusher payload limit is 10 MB, you have passed ${this.chunkingOptions.limit} therefore its recommended to keep it equal or less`,
      );
    }
  }

  /**
   * Returns the underlying pusher instance
   */
  instance() {
    return this.pusher;
  }

  /**
   * Authenticates the target `socketId` into a private channel
   * @param socketId
   * @param channelName
   * @param data
   */
  authenticate(
    socketId: string,
    channelName: string,
    data?: Pusher.PresenceChannelData,
  ) {
    return this.pusher.authenticate(socketId, channelName, data);
  }
}
