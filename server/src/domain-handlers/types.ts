import { Transaction } from 'sequelize';
import { injectable } from "inversify";

export interface Options {
  tx?: Transaction;
}

export interface IHandler<TIn, TOut> {
  Handle(input: TIn): TOut;
}

@injectable()
export abstract class BaseDomainHandler<TIn, TOut> implements IHandler<TIn, TOut> {
  private _options: Options = {};

  public setOptions(options: Options) {
    this._options = options
  }

  public abstract Handle(input: TIn): TOut;
}

@injectable()
export abstract class BaseCompositeHandler<TIn, TOut> implements IHandler<TIn, TOut> {
  constructor(
    protected readonly dbContext: any,
  ) {}

  public abstract Handle(input: TIn): TOut;
}

@injectable()
export abstract class HandlerDecoratorBase<TIn, TOut> implements IHandler<TIn, TOut> {
  constructor(
    protected readonly decorated: IHandler<TIn, TOut>
  ) {}

  public abstract Handle(input: TIn): TOut;
}
