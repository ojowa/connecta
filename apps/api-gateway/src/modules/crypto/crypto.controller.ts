import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';

@ApiTags('Crypto')
@ApiBearerAuth()
@Controller('crypto')
export class CryptoController {
  constructor(private readonly usersService: UsersService) {}

  @Post('prekeys')
  @ApiOperation({
    summary: 'Upload pre-key bundle (identity key, signed pre-key, one-time pre-keys)',
  })
  uploadPreKeyBundle(@Body('_userId') userId: string, @Body() body: any) {
    return this.usersService.uploadPreKeys(userId, body);
  }

  @Get('prekeys/:userId')
  @ApiOperation({ summary: 'Get pre-key bundle for a user' })
  getPreKeyBundle(@Param('userId') userId: string) {
    return this.usersService.getPreKeyBundle(userId);
  }

  @Post('prekeys/claim/:keyId')
  @ApiOperation({ summary: 'Claim a one-time pre-key' })
  claimOneTimePreKey(@Param('keyId') keyId: string) {
    return { claimed: true, keyId };
  }

  @Delete('prekeys/:keyId')
  @ApiOperation({ summary: 'Delete a consumed one-time pre-key' })
  deleteOneTimePreKey(@Param('keyId') keyId: string) {
    return { deleted: true, keyId };
  }

  @Get('sessions/:userId')
  @ApiOperation({ summary: 'Get active sessions for a user' })
  getActiveSessions(@Param('userId') userId: string) {
    return this.usersService.getSessions(userId);
  }

  @Post('backup')
  @ApiOperation({ summary: 'Upload encrypted key backup' })
  uploadBackup(@Body('_userId') userId: string, @Body() body: any) {
    return this.usersService.backupKeys(userId, body);
  }

  @Get('backup')
  @ApiOperation({ summary: 'Get encrypted key backup' })
  getBackup(@Body('_userId') userId: string) {
    return this.usersService.getBackup(userId);
  }
}
