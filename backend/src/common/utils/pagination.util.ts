export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export class PaginationUtil {
  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static getTake(limit: number): number {
    return limit;
  }

  static getMeta(page: number, limit: number, total: number): PaginationMeta {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static normalizeOptions(
    page?: number,
    limit?: number,
  ): { page: number; limit: number } {
    const normalizedPage = page && page > 0 ? page : 1;
    const normalizedLimit = limit && limit > 0 && limit <= 100 ? limit : 10;

    return {
      page: normalizedPage,
      limit: normalizedLimit,
    };
  }
}
