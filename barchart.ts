import cookie from 'cookie';
import got from 'got';

async function getToken() {
  const token = await got("https://www.barchart.com", {
    method: "GET"
  });
  
  let xsrfToken: string | null = null;
  let laravelToken: string | null = null;

  token.headers?.['set-cookie']?.forEach(v => {
    const parse = cookie.parse(v)
    if (parse["XSRF-TOKEN"]) xsrfToken = parse["XSRF-TOKEN"];
    if (parse.laravel_token) laravelToken = parse.laravel_token;
  });

  if (xsrfToken == null || laravelToken == null) throw new Error("Barchart token data was non-existy");

  return {
    "XSRF-TOKEN": xsrfToken as string,
    "laravel_token": laravelToken as string,
  };
}

export async function getPriceSurprises() {
  const token = await getToken();
  const baseUrl = "https://www.barchart.com/proxies/core-api/v1/quotes/get?list=stocks.us.price_surprises.advances.overall&orderDir=desc&fields=symbol&orderBy=standardDeviation&meta=field.shortName%2Cfield.type%2Cfield.description&hasOptions=true&page=1&limit=1000";
  const tickers = JSON.parse((await got(baseUrl, {
    method: "GET",
    "headers": {
      "Origin": "https://www.barchart.com",
      "X-XSRF-TOKEN": token['XSRF-TOKEN'],
      "Cookie": cookie.serialize("XSRF-TOKEN", token['XSRF-TOKEN']) + "; " + cookie.serialize("laravel_token", token.laravel_token)
    }
  })).body).data;
  
  return barchartTickerObjectsToArray(tickers);
}

async function barchartTickerObjectsToArray(arr: Array<any>) {
  return arr.map(obj => obj.symbol);
}