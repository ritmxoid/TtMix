/**
 * Cloudflare Worker: Reverse Proxy для TypeMixer (Google AI Studio Applet)
 * 
 * Инструкция по настройке в Cloudflare:
 * 1. Откройте панель Cloudflare Dashboard (dash.cloudflare.com)
 * 2. Перейдите в раздел "Workers & Pages" -> "Create application" -> "Create Worker"
 * 3. Назовите воркер (например, "typemixer" или "ttmix")
 * 4. Нажмите "Deploy" -> "Edit code"
 * 5. Замените весь код воркера содержимым этого файла и нажмите "Deploy"
 * 6. Вы сразу получите бесплатную красивую ссылку:
 *    https://typemixer.<ваш-аккаунт>.workers.dev
 * 
 * 7. (Опционально) Чтобы подключить СВОЙ домен:
 *    В настройках воркера перейдите во вкладку "Settings" -> "Domains & Routes" -> "Add Custom Domain"
 *    и укажите нужный поддомен (например, ttmix.yourdomain.com).
 */

const TARGET_HOST = 'ais-pre-d35fgrpvyscerohkmgduvw-67272448595.asia-southeast1.run.app';
const TARGET_ORIGIN = `https://${TARGET_HOST}`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Подменяем хост на адрес приложения в Google Cloud Run
    url.hostname = TARGET_HOST;
    url.protocol = 'https:';
    url.port = '443';

    // Копируем заголовки запроса и выставляем корректный Host
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('Host', TARGET_HOST);
    reqHeaders.set('X-Forwarded-Host', request.headers.get('Host') || url.hostname);
    reqHeaders.set('X-Forwarded-Proto', 'https');

    const newRequest = new Request(url.toString(), {
      method: request.method,
      headers: reqHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      redirect: 'follow',
    });

    try {
      const response = await fetch(newRequest);

      // Клонируем заголовки ответа для снятия ограничений фреймов при необходимости
      const respHeaders = new Headers(response.headers);
      respHeaders.delete('X-Frame-Options');
      respHeaders.set('Access-Control-Allow-Origin', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: respHeaders,
      });
    } catch (err) {
      return new Response(`Proxy Error: ${err.message}`, { status: 502 });
    }
  },
};
