import { Injector, runInInjectionContext } from '@angular/core';

export const runInContext = <T>(fn: () => T, injector: Injector) => {
  return runInInjectionContext(injector, fn);
};
