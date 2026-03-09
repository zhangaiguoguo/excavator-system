import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DictService } from './dict.service';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { CreateDictDataDto } from './dto/create-dict-data.dto';
import { UpdateDictDataDto } from './dto/update-dict-data.dto';

@Controller('system/dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  // DictType Endpoints

  @Post('type')
  createType(@Body() createDictTypeDto: CreateDictTypeDto) {
    return this.dictService.createType(createDictTypeDto);
  }

  @Get('type/list')
  findAllType(@Query() query: any) {
    return this.dictService.findAllType(query);
  }

  @Get('type/:id')
  findOneType(@Param('id') id: string) {
    return this.dictService.findOneType(id);
  }

  @Patch('type/:id')
  updateType(@Param('id') id: string, @Body() updateDictTypeDto: UpdateDictTypeDto) {
    return this.dictService.updateType(id, updateDictTypeDto);
  }

  @Delete('type/:id')
  removeType(@Param('id') id: string) {
    return this.dictService.removeType(id);
  }

  // DictData Endpoints

  @Post('data')
  createData(@Body() createDictDataDto: CreateDictDataDto) {
    return this.dictService.createData(createDictDataDto);
  }

  @Get('data/list')
  findAllData(@Query() query: any) {
    return this.dictService.findAllData(query);
  }

  @Get('data/:id')
  findOneData(@Param('id') id: string) {
    return this.dictService.findOneData(id);
  }

  @Patch('data/:id')
  updateData(@Param('id') id: string, @Body() updateDictDataDto: UpdateDictDataDto) {
    return this.dictService.updateData(id, updateDictDataDto);
  }

  @Delete('data/:id')
  removeData(@Param('id') id: string) {
    return this.dictService.removeData(id);
  }

  @Get('data/type/:dictType')
  getDataByType(@Param('dictType') dictType: string) {
    return this.dictService.getDataByType(dictType);
  }
}
