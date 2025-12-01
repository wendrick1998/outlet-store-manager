const CACHE_NAME = 'outlet-store-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Barcode+39+Text&display=swap'
];

// Instalação: Cacheia os arquivos estáticos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativação: Limpa caches antigos se houver atualização
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de Requisições (Fetch)
self.addEventListener('fetch', (event) => {
  // Estratégia: Stale-While-Revalidate para recursos estáticos, Network-First para outros
  // Ignora requisições POST (API Gemini)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se tiver no cache, retorna o cache, mas busca atualização em background
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Se a resposta for válida, atualiza o cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se falhar a rede (Offline), não faz nada pois já retornou o cache ou vai cair no fallback
      });

      return cachedResponse || fetchPromise;
    })
  );
});