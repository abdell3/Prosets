import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

type Constructor = new (...args: unknown[]) => object;

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype as Constructor, value as object);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((error) => {
        return Object.values(error.constraints ?? {}).join(', ');
      });
      throw new BadRequestException(messages.join('; '));
    }

    return object;
  }

  private toValidate(metatype: Constructor): boolean {
    const types: Constructor[] = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ] as Constructor[];
    return !types.includes(metatype);
  }
}
