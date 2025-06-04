import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { CreateSipDto } from './dto/create-sip.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('goals')
@Controller('goals')
@ApiBearerAuth()
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create goal' })
  async createGoal(@CurrentUser() user: any, @Body() createGoalDto: CreateGoalDto) {
    const dbUser = await this.goalsService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.goalsService.createGoal(dbUser.id, createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user goals' })
  async getGoals(@CurrentUser() user: any) {
    const dbUser = await this.goalsService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.goalsService.getUserGoals(dbUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by ID' })
  getGoal(@Param('id') id: string) {
    return this.goalsService.getGoal(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update goal' })
  updateGoal(@Param('id') id: string, @Body() updateData: Partial<CreateGoalDto>) {
    return this.goalsService.updateGoal(id, updateData);
  }

  @Post('sips')
  @ApiOperation({ summary: 'Create SIP' })
  createSip(@Body() createSipDto: CreateSipDto) {
    return this.goalsService.createSip(createSipDto);
  }

  @Get('sips/:goalId')
  @ApiOperation({ summary: 'Get SIPs for goal' })
  getSips(@Param('goalId') goalId: string) {
    return this.goalsService.getSips(goalId);
  }
}

