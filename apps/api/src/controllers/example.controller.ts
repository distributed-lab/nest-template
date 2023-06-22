import { Controller, Get, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Examples')
@Controller('v1/example')
export class ExampleController {
  @ApiOperation({ summary: 'Get a list of all examples' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Get a list of examples' })
  @Get()
  getAllChains() {
    return [{ id: 1, name: 'Example' }]
  }
}
