import { ApolloServer, gql, IResolvers } from "apollo-server-express";
import express from "express";
import { getHistoricalDataFromYahoo, getStockDataFromYahoo } from "./yahoo";
import { getPriceSurprises } from "./barchart"

async function startApolloServer() {
    const app = express();

    const typeDefs = gql`
        type Stock {
            currency: String
            price: Float!
            changeSinceOpen: Float
            percentChange: Float
            open: Float!
            close: Float!
            volume: Float!
            avgVolume: Float
            dayRange: Range # Day's Range
            yearRange: Range # 52 Week Range
            bid: BidAsk!
            ask: BidAsk!
            marketCap: Float
            beta: Float
            peRatio: Float
            eps: Float
            earningsDate: Float
            forwardDividendAndYield: ForwardDividendAndYield
            exDividendDate: Float
            oneYearTargetEst: Float
        }

        type Range {
            min: Float!
            max: Float!
        }

        type HistoricalDataPoint {
            min: Float!
            max: Float!
            time: Int!
        }

        type BidAsk {
            price: Float!
            amt: Float!
        }

        type ForwardDividendAndYield {
            amt: Float!
            percent: Float!
        }

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

        type Query {
            Stock(ticker: String!): Stock
            HistoricalData(ticker: String!, start: Int!, end: Int!, interval: Interval!): [HistoricalDataPoint!]
            PriceSurprises: [String!]
        }
    `;

    const resolvers: IResolvers<any, any> = {
        Query: {
            Stock(parent, args, context, info) {
                return getStockDataFromYahoo(args.ticker)
            },
            HistoricalData(parent, args, context, info) {
                return getHistoricalDataFromYahoo(args.ticker, args.start, args.end, args.interval)
            },
            PriceSurprises() {
                return getPriceSurprises();
            }
        }
    };

    const port = 3000;

    const server = new ApolloServer({ typeDefs, resolvers, playground: true, introspection: true });
    await server.start();

    server.applyMiddleware({ app: (app as any), path: "/graphql" });

    app.listen(port);
    console.log(`Listening on port ${port}`);
}

startApolloServer();
