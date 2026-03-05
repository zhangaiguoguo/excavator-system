import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { Machine } from './machine.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  findAll(): Promise<Machine[]> {
    return this.machinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Machine | null> {
    return this.machinesService.findOne(id);
  }

  @Post()
  create(@Body() createMachineDto: CreateMachineDto): Promise<Machine> {
    return this.machinesService.create(createMachineDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMachineDto: UpdateMachineDto): Promise<Machine | null> {
    return this.machinesService.update(id, updateMachineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.machinesService.remove(id);
  }
}
