import { ApolloError } from 'apollo-server-express';
import fetch from 'node-fetch';
import { FormattableNumber, NumRange, StockData } from './interface';
import { JSDOM } from 'jsdom';

export async function getHistoricalDataFromYahoo(ticker: string, start: number, end: number, interval: string): Promise<NumRange[]> {
    // string baseUrl = $"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}";

    const now = Date.now() / 1000;
    // oh sorry, I ran format document, is this bad? Probably not
    const range =
        start < now - 86400 ? "1D" :
            start < now - 432000 ? "5D" :
                start < now - 2592000 ? "1MO" :
                    start < now - 7776000 ? "3MO" :
                        start < now - 31536000 ? "1Y" :
                            start < now - 63072000 ? "2Y" :
                                start < now - 157680000 ? "5Y" :
                                    "max";

    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=${range}&interval=${interval}`;
    const res = (await (await fetch(baseUrl)).json()).chart;

    if (res.error != null) {
        throw new ApolloError(`There was an error fetching the data: ${res.error}`);
    }

    const result = res.result[0];
    const data = result.meta;
    const quote = result.indicators.quote[0];

    const startIndex = data.timestamp.findIndex((v: number) => v >= start);
    let endIndex = data.timestamp.findIndex((v: number) => v >= end);

    if (endIndex == 0) endIndex = data.timestamp.length - 1;
}

async function getStockDataFromYahoo(ticker: string): Promise<StockData> {
    // do you have to set some sort of no js header?
    // not technically no
    // because jsdom won't run any of the scripts unless u tell it to?
    // I think it still sends the js even if it has a browser header that's nojs
    // If you look at the page source it contains no server side rendered stuff
    // wdym? how would u be able to tell?
    // look at the page source
    // wdym?
    // I'm looking at the inspector rn
    // right click, view page source
    // I'm prolly blind, but I don't see that?
    // bruh
    // screenshot?
    const baseUrl = `https://finance.yahoo.com/quote/${ticker}`;
    const document = fetch(baseUrl).;
    for (const table of document.querySelectorAll('table')) {
        for (const entry of table.firstElementChild.children) {
            console.log(entry.children[0].textContent);
            console.log(entry.children[1].textContent);
        }
    }
    return {

    }
}

// Ima just leave this down here
/*
    const positionOfToday = result.timestamp.findIndex((v: number) => v > data.currentTradingPeriod.pre.start);

    const change = data.regularMarketPrice - data.previousClose;

    const volume: number = quote.volume.slice(positionOfToday).reduce((a: number, v: number) => a + v, 0);

    const avgVolume = quote.volume.reduce((a: number, v: number) => a + v, 0) / data.tradingPeriods.length;

    const dailyMin = Math.min(...quote.low.slice(positionOfToday));
    const dailyMax = Math.max(...quote.high.slice(positionOfToday));

    return {
        price: {
            raw: data.regularMarketPrice,
            formatted: data.regularMarketPrice.toFixed(2)
        },
        changeSinceOpen: {
            raw: change,
            formatted: change.toFixed(2),
        },
        percentChange: {
            raw: change / data.previousClose,
            formatted: ((change / data.previousClose) * 100).toFixed(2),
        },
        open: {
            raw: quote.open[0],
            formatted: quote.open[0].toFixed(2),
        },
        volume,
        avgVolume,
        dayRange: {
            min: dailyMin,
            max: dailyMax,
        }
    }
*/