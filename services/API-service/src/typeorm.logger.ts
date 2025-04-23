import { Logger } from '@nestjs/common';

import { QueryRunner, Logger as TypeOrmLogger } from 'typeorm';
import { LoggerOptions as TypeOrmLoggerOptions } from 'typeorm/logger/LoggerOptions';

/**
 * Effectively ripped out from:
 * https://github.com/typeorm/typeorm/blob/master/src/logger/SimpleConsoleLogger.ts
 */
export class TypeOrmLoggerContainer implements TypeOrmLogger {
  constructor(
    private readonly logger: Logger,
    private readonly options: TypeOrmLoggerOptions,
  ) {}

  /**
   * Logs query and parameters used in it.
   */
  logQuery(query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    if (
      this.options === 'all' ||
      this.options === true ||
      (this.options instanceof Array && this.options.indexOf('query') !== -1)
    ) {
      const sql =
        query +
        (parameters && parameters.length
          ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
          : '');
      this.logger.log('query' + ': ' + sql);
    }
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(
    error: string,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ) {
    if (
      this.options === 'all' ||
      this.options === true ||
      (this.options instanceof Array && this.options.indexOf('error') !== -1)
    ) {
      const sql =
        query +
        (parameters && parameters.length
          ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
          : '');
      this.logger.error(`query failed: ` + sql);
      this.logger.error(`error:`, error);
    }
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ) {
    const sql =
      query +
      (parameters && parameters.length
        ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
        : '');
    this.logger.warn(`query is slow: ` + sql);
    this.logger.warn(`execution time: ` + time);
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
    if (
      this.options === 'all' ||
      (this.options instanceof Array && this.options.indexOf('schema') !== -1)
    ) {
      this.logger.log(message);
    }
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, _queryRunner?: QueryRunner) {
    this.logger.log(message);
  }

  /**
   * Perform logging using given logger, or by default to the this.logger.
   * Log has its own level and message.
   */
  log(
    level: 'log' | 'info' | 'warn',
    message: unknown,
    _queryRunner?: QueryRunner,
  ) {
    switch (level) {
      case 'log':
        if (
          this.options === 'all' ||
          (this.options instanceof Array && this.options.indexOf('log') !== -1)
        )
          this.logger.log(message);
        break;
      case 'info':
        if (
          this.options === 'all' ||
          (this.options instanceof Array && this.options.indexOf('info') !== -1)
        )
          this.logger.debug(message);
        break;
      case 'warn':
        if (
          this.options === 'all' ||
          (this.options instanceof Array && this.options.indexOf('warn') !== -1)
        )
          this.logger.warn(message);
        break;
    }
  }

  /**
   * Converts parameters to a string.
   * Sometimes parameters can have circular objects and therefor we are handle this case too.
   */
  protected stringifyParams(parameters: unknown[]) {
    try {
      return JSON.stringify(parameters);
    } catch (error: unknown) {
      // most probably circular objects in parameters
      console.error(error);
      return parameters;
    }
  }
}
