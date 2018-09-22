import webpack from 'webpack';
import v1 from 'uuid/v1';
import compression from 'compression';
import fs from 'fs';
import {parse, stringify} from 'csv';
import React from 'react';
import {renderToString} from 'react-dom/server';
import bodyParser from 'body-parser';
import netjet from 'netjet';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import express from 'express';
import path from 'path';
import cors from 'cors';
import configuration from './webpack.config';

const devServerOptions = {
  quiet: true,
  noInfo: true,
  hot: true,
  progress: true,
  publicPath: configuration.output.publicPath,
  watchOptions: {
    aggregateTimeout: 300,
    ignored: /node_modules/
  },
  headers: {'Access-Control-Allow-Origin': '*'},
  stats: {colors: true},
  historyApiFallback: true
};

const curHash = v1();
const app = express();
const compiler = webpack(configuration);

const renderPage = (req, res) => {
  const body = renderToString(
    <html lang="ru">
      <head>
        <title>Tanks</title>
        <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, user-scalable=0"/>
        <link rel="stylesheet" href={`/js/styles.css?${curHash}`}/>
      </head>
      <body>
        <div className="js-app"/>
        <script src={`/js/babel-polyfill.js?${curHash}`} defer async/>
        <script src={`/js/bundle.js?${curHash}`} async/>
      </body>
    </html>
  );

  res.status(200);
  return res.send(`<!doctype html>${body}`);
};

app
  .use(compression())
  .use(WebpackDevMiddleware(compiler, devServerOptions))
  .use(WebpackHotMiddleware(compiler))
  .use(bodyParser.json())
  .use(bodyParser.raw())
  .use(bodyParser.urlencoded())
  .use(cors({credentials: true, origin: true}))
  .use(netjet())
  .use(express.static(path.join(__dirname, 'public'), {maxAge: '120d'}));

app.get('*', renderPage);

app.listen(
  3000,
  (error) => {
    if (error) {
      console.error(error.stack || error);
      throw error;
    }

    console.log('Running on localhost:3000');
  }
);
