# Solution - Zach Blume

## Part 1: Rest API solution

### Cloud deployment

If you don't feel like running it locally, I deployed it to Vercel and ElephantSQL :) Take a look at http://demx.vercel.app/ or just the api routes at http://demx.vercel.app/api/json and http://demx.vercel.app/api/sql

### Running locally with `make`

To run the solution locally, run the following in your terminal:

```
# Run in your terminal. Requires docker and Node.
git clone https://github.com/zachblume/ddx-takehome-zach-blume.git

cd ddx-takehome-zach-blume

make
```

and head over in your browser to: `http://localhost:3000/api/json` to get the JSON solution.

Or `http://localhost:3000/api/sql` to get the SQL solution.

and `http://localhost:3000/` for a little frontend consumer of that API.

#### NOTE: running this makefile...

-   requires `docker-desktop` to be running (uses compose v2)
-   the first spin-up may take a while if you've never pulled the postgres image
-   requires `Node` and `Node Package Manager (NPM)`
-   seeds the database using `/prisma/seed.js` at compile time appropriately for the SQL solution endpoint to work as well as the manual query specified below

If you want to run it without Docker/Postgres, you can just run `npm run dev` and get the JSON API solution running by itself.

To introspect the SQL instance, run:

```
psql "postgresql://postgres:postgres@localhost:5432/postgres"
```

and try:

```
select * from "ElectionResults";
```

#### What are the most relevant files?

```
/src/app/api/json/route.js
/src/app/api/sql/route.js
/src/lib/unNest.js
/public/example.json - Colorado 2020 pres primary results

/src/app/page.json - Homepage/frontend, built with Tailwind UI

Makefile
docker-compose.yml
```

### Part 2: Single SQL statement solution

This solution uses a CTE for clarity, pulling out the maximum vote count for each State-County-Party group. That's enough to identify the winner (or winners! if there is a tie).

It then runs an INNER JOIN to only keep candidate-level election results of candidates in each State-County-Party group who have the vote total matching the groups' maximum (winning) vote amount.

```
WITH winningcounttable AS (
  SELECT
    concat(state, county, party) AS countyparty,
    max(votes) AS winningvotecount
  FROM
    "ElectionResults"
  GROUP BY
    countyparty
)
SELECT
  state,
  county,
  party,
  candidate,
  votes
FROM
  "ElectionResults"
  JOIN winningcounttable ON votes = winningvotecount
  AND concat(state, county, party) = winningcounttable.countyparty;
```

If you wanted it to be a single query without a CTE, you could just nest the CTE into the JOIN.

If you wanted it to be as concise as possible to a single query with no nested queries, a window function gets close:

```
SELECT
  candidate,
  state,
  county,
  party,
  votes
FROM (
    SELECT
      *, max(votes) OVER (PARTITION BY concat(state, county, party)) = votes as is_winner
    FROM "ElectionResults"
) AS temptable
WHERE
  is_winner = true;
```

I can't think of any way to do it without nested queries or CTEs.

### Part 3: System design for hourly incremental ETL

_Say the data provider tells you JSON files will be arriving once an hour with incremental vote count updates. You are tasked with architecting a system to load those files into the table from part 2 once they arrive. In a paragraph or two, please answer the following:_

● _What does your ideal architecture look like to accomplish this?_
● _What questions do you still need answered in order to build the system?_

For me, I think the ideal architecture with the goal of simplicity, uptime, and reliability is **having the JSON files arriving in an Amazon S3 bucket, triggering a Lambda that loads it into a failover-protected SQL database**.

-   DURABILITY: Lambdas can run for up to 15 minutes of clock time, so that's enough to process billions of rows per file. Lambdas fan out/scale out to a degree far greater than this current problem and therefore the load handling will be consistently adequate.
-   CONSISTENCY: The failure rate of Lambda's is held extremely low, one of the side effects is that the function is more often "accidentily invoked twice" as a anti-failure precaution. Therefore, we'd need to modify our code to have state tracking for the ETL process to ensure the function effects are "idempotent", i.e., accidentily invoking the function N\* times gives the same effect as invoking it once. This could be accomplished by having a file_migration table in our Postgres database and hitting it before at the beginning and end of function execution as a check and final mutation of ETL state ("finished!"). Using state tracking means we need to also think about failover of our data store, Postgres is sturdy but we could increase that with an RDS instance for failover protection, etc.
-   SIMPLICITY: The code I already wrote for the previous answers are Next.js function which is just a thin deployment wrapper on a Amazon Lambda, so the code we've already written can be deployed there with almost no modifications. The vendor uploading to S3 is a well documented and widely used/integrated API so that's simple.
-   ATOMICITY: The current code doesn't do error handling very well. For larger files, or given the possibility of a mometary database interruption, we'd need to look at (1) the error handling and (2) handling failed state in the transaction state table. E.g.: A every-half-hour Chron that executes a cleanup Lambda that re-attempts any failed past transactions.

**There are more powerful tools we could have chosen: dbt, bigquery/redshift and their built-in data loaders, etc, but sometimes the simple is better!**

Several advantages of this approach over more complex or more cloud-pipeline reliant tooling:

-   ISOLATION: The development environment of this S3 bucket, Lambda, and Postgres instance can be isolated from all other development projects. Errors through human intervention / configuration changes is the most likely reason for a interruption in service for this kind of service.
-   LOW COST:
    -   Lambdas are effectively free
    -   S3 is effectively free at this level of storage
    -   For a small dataset, an independent RDS instance with multi-AZ failover can be $10-20/month
-   MONITORING AND INTROSPECTION: This stack is simple, vendor-nonspecific, and time tested, allowing for easy deployment and monitoring through simple logging and/or middleware logging.

**Questions that might lead me to change my approach:**

-   How will the provider deliver the file? If they can't upload it to S3, that might be another ETL step.
-   Is there any way that the data is much larger in scope?
-   What kind of data anomolies can we expect? We would want to look at more sample data before deciding fully on an approach (e.g., if its not a vendor but the government, then every state probably architects their file differently and we've talking a much more complex data ETL situation.)
-   Who will be maintaing this pipeline?
-   How important is it and in what way does this need to follow the patterns of existing pipelines for easy cross-tooling and future maintenance? This could lead a significaintly different approach, for example, if we're building and maintaining 100 other similar pipelines.

---

---

# The readme below is from the original PDF file/spec...

# Software Engineer–Coding Walkthrough

##### Current as of 20220803

Please attempt this exercise using whichever tools you prefer.

A coding exercise is not a natural or normal way to approach work–the outcome here is that we get to see how you approach a new problem, discover issues with your first assumptions, and ask questions–not that we get to see a perfectly functioning piece of code.

Please do not spend more than 120 minutes on this.If you’re stuck, write out where you need help or what you would do next, and send it over to us. While the parts of the exercise are related, you do not need to complete the parts in order.

## Exercise

You are given a JSON formatted file that contains Primary election results by state, county, party, and candidate. An example record is provided below:

```
{
    "Pennsylvania": {
        "Chester": {
            "Democrats": {
                "Humphrey": 10000,
                "McGovern": 5000
            },
            "Republicans": {
                "Nixon": 20000,
                "Ashbrook": 200,
                "McCloskey": 100
            }
        }
    }
}
```

### Part 1:

Using the language of your choice, write a lightweight REST API with a single route that returns the winning primary candidate in each county. (Reminder: There are separate Republican and Democratic winners in each county)

###Part 2:

Suppose the data existed in a SQL database, with the data fit into a tabular format with the table structure of

```
CREATE TABLE results (
state VARCHAR
, county VARCHAR
, party VARCHAR
, candidate VARCHAR
, votes INTEGER
);
```

Can you write a single SELECT query that returns the winning primary candidate in each county?

### Part 3:

Say the data provider tells you JSON files will be arriving once an hour with incremental vote count updates. You are tasked with architecting a system to load those files into the table from part 2 once they arrive. In a paragraph or two, please answer the following:

● What does your ideal architecture look like to accomplish this?
● What questions do you still need answered in order to build the system?

Questions? Email adam@demexchange.com.
