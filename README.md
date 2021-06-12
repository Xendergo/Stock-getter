# Stock-getter
A graphql service that gets stock data from yahoo finance and barchart (price surprises)

## Documentationy bros
### Schema
```gql
type Stock {
    currency: String # USD, CAD, BOB, etc.
    price: Float!
    changeSinceOpen: Float!
    percentChange: Float! # % change since start of day
    open: Float! # Open
    close: Float! # Previous Close
    volume: Float! # Volume
    avgVolume: Float # Avg. Volume
    dayRange: Range # Day's Range
    yearRange: Range # 52 Week Range
    bid: BidAsk! # Bid
    ask: BidAsk! # Ask
    marketCap: Float # Market Cap
    beta: Float # Beta (5Y Monthly)
    peRatio: Float # PE Ratio (TTM)
    eps: Float # EPS (TTM)
    earningsDate: Float # Earnings Date
    forwardDividendAndYield: ForwardDividendAndYield # Forward Dividend & Yield
    exDividendDate: Float # Ex-Dividend Date
    oneYearTargetEst: Float # 1y Target Est
}

# a range type
type Range {
    min: Float!
    max: Float!
}

# A data point returned by HistoricalData, showing the min and max price, and the time of the data point
type HistoricalDataPoint {
    min: Float!
    max: Float!
    time: Int!
}

# a bid / ask data type that contains the amount and price of the last bid / ask
type BidAsk {
    price: Float!
    amt: Float!
}

type ForwardDividendAndYield {
    amt: Float!
    percent: Float!
}

# for chart data intervals
enum Interval {
    ONE_MINUTE,
    TWO_MINUTE,
    FIVE_MINUTE,
    FIFTEEN_MINUTE,
    THIRTY_MINUTE,
    SIXTY_MINUTE,
    NINTY_MINUTE,
    ONE_DAY,
    FIVE_DAY,
    ONE_WEEK,
    ONE_MONTH,
    THREE_MONTH
}

# A query type that routes requests for getting stock data, historical data, and pricesurprises
type Query {
    Stock(ticker: String!): Stock
    HistoricalData(ticker: String!, start: Int!, end: Int!, interval: Interval!): [HistoricalDataPoint!]
    PriceSurprises: [String!]
}
```

### Documentation
All times are seconds since the last epoch (January 1, 1970)
#### Stock
Get data for a specific stock

Takes a ticker as an argument

Returns all the data displayed next to the chart on finance.yahoo.com

#### HistoricalData
Get a list of data points showing the min and max price between a start and end times, with a specific interval

If the range is bigger than the amount of data available, it will return as much data as it can.
Might skip some data points if yahoo doesn't have any data for those data points.

### PriceSurprises
The list of stock tickers listed as price surprises on barchart