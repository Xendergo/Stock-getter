import { ApolloError } from 'apollo-server-express';
import fetch from 'node-fetch';
import { NumRange, StockData } from './interface';
import { JSDOM } from 'jsdom';
import { match } from 'ts-pattern';

export async function getHistoricalDataFromYahoo(ticker: string, start: number, end: number, intervalEnum: string): Promise<NumRange[]> {
    // string baseUrl = $"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}";

    const now = Date.now() / 1000;

    const range = match(start)
        .when((value) => value < now - 86400, () => "1D")
        .when((value) => value < now - 432000, () => "5D")
        .when((value) => value < now - 2592000, () => "1MO")
        .when((value) => value < now - 7776000, () => "3MO")
        .when((value) => value < now - 31536000, () => "1Y")
        .when((value) => value < now - 63072000, () => "2Y")
        .when((value) => value < now - 157680000, () => "5Y")
        .otherwise(() => "max")

    const interval = match(intervalEnum)
        .with("ONE_MINUTE", () => "1m")
        .with("TWO_MINUTE", () => "2m")
        .with("FIVE_MINUTE", () => "5m")
        .with("FIFTEEN_MINUTE", () => "15m")
        .with("THIRTY_MINUTE", () => "30m")
        .with("SIXTY_MINUTE", () => "60m")
        .with("NINTY_MINUTE", () => "90m")
        .with("ONE_DAY", () => "1d")
        .with("FIVE_DAY", () => "5d")
        .with("ONE_WEEK", () => "1wk")
        .with("ONE_MONTH", () => "1mo")
        .with("THREE_MONTH", () => "3mo")
        .otherwise(() => {
            throw new Error("Unreachable")
        })

    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=${range}&interval=${interval}`;
    const res = (await (await fetch(baseUrl)).json()).chart;

    if (res.error != null) {
        throw new ApolloError(`There was an error fetching the data: ${res.error.description}`);
    }

    const result = res.result[0];
    const data = result.meta;
    const quote = result.indicators.quote[0];

    const startIndex = result.timestamp.findIndex((v: number) => v >= start);
    let endIndex = result.timestamp.findIndex((v: number) => v >= end);

    if (endIndex == 0) endIndex = result.timestamp.length - 1;

    const ret = [];

    for (let i = startIndex; i < endIndex; i++) {
        ret.push({
            min: quote.low[i],
            max: quote.high[i],
        })
    }

    return ret;
}

export async function getStockDataFromYahoo(ticker: string): Promise<StockData> {
    const baseUrl = `https://finance.yahoo.com/quote/${ticker}`;
    const document = (new JSDOM(await (await fetch(baseUrl)).buffer())).window.document;
    const tables = document.querySelectorAll('table');
    const quoteHeader = document.querySelector('#quote-header-info');
    const currency = quoteHeader.children[1].children[0].children[1].innerHTML.split(" ").pop();
    console.log(quoteHeader);

    const stock: StockData = {
        currency
    } as StockData;

    for (const table of tables) {
        for (const entry of table.children[0].children) {
            const tableData: string = entry.children[0].textContent.trim().toLowerCase();

            // switch (tableData) {
            //     case "previous close":
            //         break;
            //     case "open":
            //         break;
            //     case "bid":
            //         break;
            //     case "ask":
            //         break;
            //     case "day's range"
            //         
            //     case "52 week range"
            //     
            //     default:
            //         throw "wtf";
            //         break;
            // }

            const content: string | null = entry.children[1].textContent.includes("N/A") ? null : entry.children[1].textContent.trim();

            match(tableData)
                .with("previous close", () => {
                    if (content == null) throw new Error("Oof, close was null when it shouldn't have been")

                    stock.close = parseFloat(content)
                })
                .with("open", () => {
                    if (content == null) throw new Error("Oof, open was null when it shouldn't have been")

                    stock.open = parseFloat(content)
                })
                .with("bid", () => {
                    if (content == null) return;
                    
                    let [price, amt] = content.split(' x ').map(v => parseFloat(v));
                    
                    stock.bid = {
                        price, amt
                    }
                })
                .with("ask", () => {
                    if (content == null) return;
                    
                    let [price, amt] = content.split(' x ').map(v => parseFloat(v));
                    
                    stock.ask = {
                        price, amt
                    }
                })
                .with("day's range", () => {
                    if (content == null) {
                        stock.dayRange = null;
                        return;
                    }

                    let [min, max] = content.split(" - ").map((v: string) => parseFloat(v))
                    stock.dayRange = {
                        min,
                        max
                    }
                })
                .with("52 week range", () => {
                    if (content == null) {
                        stock.yearRange = null;
                        return;
                    }
                    
                    let [min, max] = content.split(" - ").map((v: string) => parseFloat(v))
                    stock.yearRange = {
                        min,
                        max
                    }
                })
                .with("volume", () => {
                    if (content == null) throw new Error("Oof, volume was null when it shouldn't have been")

                    stock.volume = parseInt(content.split("").filter(v => v == ",").join(""))
                })
                .with("avg. volume", () => {
                    if (content == null) {
                        stock.avgVolume = null;
                        return;
                    }

                    stock.avgVolume = parseInt(content.split("").filter(v => v == ",").join(""))
                })
                .with("market cap", () => {
                    if (content == null) {
                        stock.marketCap = null;
                        return;
                    }

                    const multiplier = match(content.slice(-1))
                        .with("T", () => 1000000000000)
                        .with("B", () => 1000000000)
                        .with("M", () => 1000000)
                        .otherwise(() => {
                            throw new Error("The market cap of this is too small (if you get this error, please raise an issue with the stock ticker involoved)")
                        });

                    stock.marketCap = multiplier * parseFloat(content.slice(0, -1))
                })
                .with("beta (5y monthly)", () => {
                    stock.beta = content == null ? null : parseFloat(content)
                })
                .with("pe ratio (ttm)", () => {
                    stock.peRatio = content == null ? null : parseFloat(content)
                })
                .with("eps (ttm)", () => {
                    stock.eps = content == null ? null : parseFloat(content)
                })
                .with("earnings date", () => {
                    if (content == null) {
                        stock.earningsDate = null;
                        return;
                    }

                    let [min, max] = content.split(" - ").map(v => Date.parse(v));

                    max = max ?? min // if it only gives one date, make the min and max the same

                    stock.earningsDate = {
                        min,
                        max
                    }
                })
                .with("forward dividend & yield", () => {
                    if (content == null) {
                        stock.forwardDividendAndYield = null;
                        return;
                    }

                    let [amt, percent] = content.split(" ");

                    stock.forwardDividendAndYield = {
                        amt: parseFloat(amt),
                        percent: parseFloat(percent.slice(1, -2))
                    }
                })
                .with("ex-dividend date", () => {
                    if (content == null) {
                        stock.earningsDate = null;
                        return;
                    }

                    stock.exDividendDate = Date.parse(content);
                })
                .with("1y target est", () => {
                    stock.oneYearTargetEst = content == null ? null : parseFloat(content)
                })
                .otherwise(() => {
                    "bruh"
                })
            console.log(entry.children[1].textContent);
        }
    }
    // phony temp data
    return stock;
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