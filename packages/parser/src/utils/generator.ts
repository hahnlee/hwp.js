/**
 * Copyright Han Lee <hanlee.dev@gmail.com> and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export class PeekableIterator<T> {
  constructor(private readonly generator: Generator<T>) {}

  [Symbol.iterator](): T {
    return this.next()
  }

  private waiting?: IteratorResult<T>

  public next(): T {
    if (this.waiting) {
      if (this.waiting.done) {
        throw new Error('Generator is done')
      }
      const value = this.waiting.value
      this.waiting = undefined
      return value
    }

    const next = this.generator.next()
    if (next.done) {
      throw new Error('Generator is done')
    }

    return next.value
  }

  public peek(): T {
    if (!this.waiting) {
      this.waiting = this.generator.next()
    }

    if (this.waiting.done) {
      throw new Error('Generator is done')
    }
    return this.waiting.value
  }

  public isDone(): boolean {
    if (!this.waiting) {
      this.waiting = this.generator.next()
    }

    return this.waiting.done ?? false
  }
}
