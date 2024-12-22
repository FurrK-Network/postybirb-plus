import { Module } from '@nestjs/common';
import { CustomE621 } from './custom-e621.service';

@Module({
  providers: [CustomE621],
  exports: [CustomE621],
})
export class CustomE621Module {}
