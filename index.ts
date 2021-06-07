import { ApolloServer, gql, IResolvers } from "apollo-server-express";
import express from "express";
import { getHistoricalDataFromYahoo } from "./yahoo";

async function startApolloServer() {
    const app = express();

    const typeDefs = gql`
        type Stock {
            price: FormattableNumber
            changeSinceOpen: FormattableNumber
            percentChange: FormattableNumber
            open: FormattableNumber
            volume: Float
            avgVolume: Float
            dayRange: Range # Day's Range
            yearRange: Range # 52 Week Range
        }

        type FormattableNumber {
            raw: Float
            formatted: String 
        }

        type Range {
            min: Float 
            max: Float
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
            HistoricalData(ticker: String!, start: Int!, end: Int!, interval: Interval!): [Float]
        }
    `;

    const resolvers: IResolvers<any, any> = {
        Query: {
            Stock(parent, args, context, info) {
                
            },
            HistoricalData(parent, args, context, info) {

            }
        }
    };

    const port = 3000;

    const server = new ApolloServer({ typeDefs, resolvers, playground: true, introspection: true });
    await server.start();

    server.applyMiddleware({ app, path: "/graphql" });

    app.listen(port);
    console.log(`Listening on port ${port}`);
}

startApolloServer();