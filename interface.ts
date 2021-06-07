interface FormattableNumber {
    raw: number,
    formatted: string,
}

interface NumRange {
    min: number,
    max: number,
}

interface StockData {
    price: FormattableNumber,
    changeSinceOpen: FormattableNumber,
    percentChange: FormattableNumber,
    open: FormattableNumber,
    volume: number,
    avgVolume: number,
    dayRange: NumRange,
}

export {
  FormattableNumber,
  NumRange,
  StockData
}