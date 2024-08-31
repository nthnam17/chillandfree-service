import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/cms/users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
@Module({
    imports: [
        ConfigModule.forRoot(),
        UsersModule,
        AuthModule,
        TypeOrmModule.forRoot({
            type: process.env.TYPE as any,
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT),
            username: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            timezone: 'Asia/Ho_Chi_Minh',
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const expiresIn = configService.get<string>('JWT_EXPIRES_IN');
                return {
                    secret: configService.get<string>('JWT_SECRET'),
                    signOptions: { expiresIn },
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [AppController],
    providers: [AppService, JwtService, Reflector,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
          },
    ],
})
export class AppModule {}