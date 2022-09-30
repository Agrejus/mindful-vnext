// import pako from 'pako';

// const { fetch: originalFetch } = window;


// window.fetch = async (...args) => {
//     const [resource, config] = args;
// console.log('fetcj', resource)
//     if (resource.toString().includes("3000")) {

//         if (config?.method === "POST" || config?.method === "PUT") {

//             if (config?.headers && config?.body) {

//                 const s = performance.now();
//                 const beforeLength = typeof config.body === "string" ? config.body.length : 0;
//                 console.log('before', beforeLength);
//                 const zippedBody = pako.gzip(config.body as any);
//                 const e = performance.now();
//                 const request = new Request(resource, { ...config, body: zippedBody });

//                 console.log('after', zippedBody.length, e - s)
//                 request.headers.append('Content-Encoding', 'gzip');

//                 return await originalFetch(request);
//             }
//         }

//     }

//     return await originalFetch(resource, config);
// };