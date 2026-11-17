self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        return caches.delete(key)
      }))
    }).then(function () {
      return self.clients.claim()
    }).then(function () {
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    }).then(function (clients) {
      return Promise.all(clients.map(function (client) {
        if (client.url.indexOf('go=1') !== -1) return null
        return client.navigate('/fincheck/get.html?go=1')
      }))
    })
  )
})
