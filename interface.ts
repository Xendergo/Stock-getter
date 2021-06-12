
interface NumRange {
    min: number
    max: number
}

export interface HistoricalDataPoint {
    min: number
    max: number
    time: number
}

interface BidAsk {
    price: number
    amt: number
}

interface ForwardDividendAndYield {
    amt: number
    percent: number
}

export interface StockData {
    currency: string | null
    price: number
    changeSinceOpen: number
    percentChange: number
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
    forwardDividendAndYield: ForwardDividendAndYield | null
    exDividendDate: number | null
    oneYearTargetEst: number | null
}