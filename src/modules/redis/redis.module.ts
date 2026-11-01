import {CacheModule} from '@nestjs/cache-manager';
import {Module} from '@nestjs/common';
import {redisStore} from 'cache-manager-redis-store';

@Module({
    imports: [
        CacheModule.registerAsync({
            useFactory: async () => ({
                store : await redisStore({
                    Socket: {
                        host: process.env.REDIS_HOST,
                        port: Number(process.env.REDIS_PORT),
                    },
                }),
            }),
            isGlobal: true,
        }),
    ],
})

export class RedisModule {}