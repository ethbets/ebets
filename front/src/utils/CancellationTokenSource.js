/* 
 * https://gist.github.com/danharper/ad6ca574184589dea28d
 * 
*/
const CANCEL = Symbol();

class CancellationToken {

  constructor() {
    this.cancelled = false;
  }

  throwIfCancelled() {
    if (this.isCancelled()) {
      throw "Request cancelled!";
    }
  }

  isCancelled() {
    return this.cancelled === true;
  }

  [CANCEL]() {
    this.cancelled = true;
  }
  
  // could probably do with a `register(func)` method too for cancellation callbacks

}

export default class CancellationTokenSource {

  constructor() {
    this.token = new CancellationToken();
  }
  
  cancel() {
    this.token[CANCEL]();
  }
  
}