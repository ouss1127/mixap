export function PromiseRetry(fn, retriesLeft = 5, interval = 1000) {
  console.debug('PromiseRetry');
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        console.debug('PromiseRetry, error', error);
        console.debug('PromiseRetry, try.. retriesLeft', retriesLeft - 1);
        setTimeout(() => {
          if (retriesLeft === 1) {
            console.debug('PromiseRetry, maximum retries exceeded');
            return reject(error);
          }
          // Passing on "reject" is the important part
          PromiseRetry(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
}
