const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export function generateApi(baseUrl: string, opts = defaultOptions) {
  if (!fetch) throw new Error('No fetch API available');
  // Callable internal target required to use `apply` on it
  const internalTarget = () => {};

  const p = (url: string) =>
    new Proxy(internalTarget, {
      get(target, key: string) {
        const origin = Reflect.get(target, key);

        if (typeof origin === 'function') return origin.bind(target);

        if (!['get', 'post', 'put', 'delete', 'patch'].includes(key)) {
          return p(`${url}/${key}`);
        }

        const handler = (data, interceptors) => {
          const payloadOpts = {
            ...opts,
            method: key.toUpperCase(),
          };

          if (interceptors) {
            interceptors.forEach((interceptor) => {
              interceptor(payloadOpts);
            });
          }
          const searchParams = `?${new URLSearchParams(data)}`;

          switch (key) {
            case 'post':
            case 'put':
            case 'patch':
              payloadOpts.body = JSON.stringify(data);
              break;
            default:
              // eslint-disable-next-line no-param-reassign
              url = `${url}${data ? searchParams : ''}`;
          }

          return fetchAPI<Response>(url, payloadOpts);
        };

        return handler;
      },
      apply(_target, _thisArg, [arg] = []) {
        return p(arg ? `${url}/${arg}` : url);
      },
    });

  return p(baseUrl);
}

async function fetchAPI<Response>(url: string, opts?: RequestInit) {
  const resp = await fetch(url, opts);
  if (resp.ok && resp.status === 200) {
    const json = await resp.json();
    return json as Response;
  }
  if (resp.status >= 400 && resp.status < 500) {
    const json = await resp.json();
    throw json;
  }
}
