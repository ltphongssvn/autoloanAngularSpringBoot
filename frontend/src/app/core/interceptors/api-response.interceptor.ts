import { HttpInterceptorFn } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface ApiEnvelope {
  status?: { code: number; message: string };
  data?: unknown;
}

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (
        event.type !== 0 &&
        'body' in event &&
        event.body &&
        typeof event.body === 'object' &&
        'status' in (event.body as object) &&
        'data' in (event.body as object)
      ) {
        const envelope = event.body as ApiEnvelope;
        return event.clone({ body: envelope.data });
      }
      return event;
    })
  );
};
