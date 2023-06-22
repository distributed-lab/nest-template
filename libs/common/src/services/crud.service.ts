import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { DeepPartial, FindManyOptions, FindOptions, Repository, UpdateResult } from 'typeorm'

@Injectable()
export abstract class CrudService<T extends DeepPartial<R>, R = any> {
  protected constructor(private readonly entityRepository: Repository<T> | any) {}

  public async getAll(conditions?: FindManyOptions<T>): Promise<T[]> {
    try {
      return this.entityRepository.find(conditions)
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async get(conditions: FindOptions<T>): Promise<T> {
    try {
      return this.entityRepository.findOne(conditions)
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async getOneOrFail(conditions: FindOptions<T>): Promise<T> {
    try {
      return this.entityRepository.findOneOrFail(conditions)
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async create(projection): Promise<any> {
    try {
      const entity = this.entityRepository.create(projection)
      return this.entityRepository.save(entity)
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async patch(conditions, projection): Promise<UpdateResult> {
    try {
      const entity = await this.entityRepository.findOne(conditions)
      if (!entity) throw new NotFoundException()

      return this.entityRepository.update(conditions, projection)
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async deleteOne(conditions): Promise<void> {
    try {
      await this.entityRepository.delete(conditions)
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async deactivateOne(conditions) {
    try {
      const entity = await this.entityRepository.findOne(conditions)
      if (!entity) {
        throw new NotFoundException()
      }

      await this.entityRepository.update(conditions, { isActive: false })
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
