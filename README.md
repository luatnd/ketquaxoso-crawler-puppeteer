# 1. Crawl
Configure src/config.js
```
dateFrom: // default is today
dateTo: // default is today
```

Start to crawl in above date range
```
yarn crawl
```
# 2. Import to mongo db
* Use mongo Studio 3T to import `output/json/*` into `mongodb.xoso.daily_result`
> You must choose the specific needed date, do not choose redundant date
>
> Query the last date exist in db:
>
>```
>db.getCollection("daily_result_lo27").find({}).sort({date: -1})
>```

# 3. Convert daily_result into daily_result_lo27
* Use `node src/tools/ConvertDailyToLo27.js` to generate `output/lo27`
* Use mongo Studio 3T to import `output/lo27/*` into `mongodb.xoso.daily_result_lo27`
> You must choose the specific needed date, do not choose redundant date
