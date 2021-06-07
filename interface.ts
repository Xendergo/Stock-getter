
interface NumRange {
    min: number
    max: number
}

interface BidAsk {
    price: number
    amt: number
}

interface ForwardDividendAndYield {
    amt: number
    percent: number
}

interface StockData {
    currency: string | null
    price: number
    changeSinceOpen: number | null
    percentChange: number | null
    open: number
    close: number
    volume: number
    avgVolume: number | null
    dayRange: NumRange | null
    yearRange: NumRange | null
    bid: BidAsk | null
    ask: BidAsk | null
    marketCap: number | null
    beta: number | null
    peRatio: number | null
    eps: number | null
    earningsDate: NumRange | null
    dividends: number | null
    forwardDividendAndYield: ForwardDividendAndYield | null
    exDividendDate: number | null
    oneYearTargetEst: number | null
}

export {
    NumRange,
    StockData
}